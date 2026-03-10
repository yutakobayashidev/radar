import { useEffect, useRef, useState, useCallback } from "react";
import { NOSTR_RELAYS } from "~/data/nostr-config";

export interface NostrNote {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
}

export interface NostrProfile {
  name?: string;
  display_name?: string;
  picture?: string;
  about?: string;
}

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: unknown): Promise<unknown>;
    };
  }
}

const MAX_NOTES = 100;

export function useNostr() {
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [follows, setFollows] = useState<string[]>([]);
  const [notes, setNotes] = useState<NostrNote[]>([]);
  const [profiles, setProfiles] = useState<Map<string, NostrProfile>>(
    new Map(),
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const disposeFnRef = useRef<(() => void) | null>(null);

  const login = useCallback(async () => {
    if (!window.nostr) {
      throw new Error("NIP-07 extension not found");
    }
    setIsLoading(true);
    try {
      const pk = await window.nostr.getPublicKey();
      setPubkey(pk);
      localStorage.setItem("nostr_pubkey", pk);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    disposeFnRef.current?.();
    disposeFnRef.current = null;
    setPubkey(null);
    setFollows([]);
    setNotes([]);
    setProfiles(new Map());
    setIsConnected(false);
    localStorage.removeItem("nostr_pubkey");
  }, []);

  // Restore pubkey from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("nostr_pubkey");
    if (saved) setPubkey(saved);
  }, []);

  // Once we have a pubkey, fetch contact list and build timeline
  useEffect(() => {
    if (!pubkey) return;

    let disposed = false;

    (async () => {
      const { createRxNostr, createRxForwardReq, createRxOneshotReq } =
        await import("rx-nostr");
      const { verifier } = await import("rx-nostr-crypto");

      if (disposed) return;

      const rxNostr = createRxNostr({ verifier });
      rxNostr.setDefaultRelays(NOSTR_RELAYS);
      disposeFnRef.current = () => rxNostr.dispose();

      // Fetch contact list (kind:3)
      const contactReq = createRxOneshotReq({
        filters: [{ kinds: [3], authors: [pubkey], limit: 1 }],
      });

      const followPubkeys: string[] = [];

      await new Promise<void>((resolve) => {
        rxNostr.use(contactReq).subscribe({
          next: (packet) => {
            const tags = packet.event.tags;
            for (const tag of tags) {
              if (tag[0] === "p" && tag[1]) {
                followPubkeys.push(tag[1]);
              }
            }
          },
          complete: () => resolve(),
        });
      });

      if (disposed) return;

      // Include self in timeline
      const authors = [pubkey, ...followPubkeys];
      setFollows(followPubkeys);
      setIsConnected(true);

      if (authors.length === 0) return;

      // Fetch notes (kind:1)
      const notesReq = createRxForwardReq();
      rxNostr.use(notesReq).subscribe((packet) => {
        const ev = packet.event;
        setNotes((prev) => {
          if (prev.some((n) => n.id === ev.id)) return prev;
          const next = [
            {
              id: ev.id,
              pubkey: ev.pubkey,
              content: ev.content,
              created_at: ev.created_at,
            },
            ...prev,
          ];
          next.sort((a, b) => b.created_at - a.created_at);
          return next.slice(0, MAX_NOTES);
        });
      });
      notesReq.emit([{ kinds: [1], authors, limit: 50 }]);

      // Fetch profiles (kind:0)
      const profileReq = createRxForwardReq();
      rxNostr.use(profileReq).subscribe((packet) => {
        const ev = packet.event;
        try {
          const profile = JSON.parse(ev.content) as NostrProfile;
          setProfiles((prev) => {
            const next = new Map(prev);
            next.set(ev.pubkey, profile);
            return next;
          });
        } catch {
          /* ignore malformed profiles */
        }
      });
      profileReq.emit([{ kinds: [0], authors }]);
    })();

    return () => {
      disposed = true;
      disposeFnRef.current?.();
      disposeFnRef.current = null;
      setIsConnected(false);
    };
  }, [pubkey]);

  const hasExtension = typeof window !== "undefined" && !!window.nostr;

  return {
    pubkey,
    follows,
    notes,
    profiles,
    isConnected,
    isLoading,
    hasExtension,
    login,
    logout,
  };
}
