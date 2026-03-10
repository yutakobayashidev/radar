import { useEffect, useRef, useState, useCallback } from "react";
import { NOSTR_RELAYS, OWNER_NPUB } from "~/data/nostr-config";

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
  const [signerPubkey, setSignerPubkey] = useState<string | null>(null);
  const [follows, setFollows] = useState<string[]>([]);
  const [notes, setNotes] = useState<NostrNote[]>([]);
  const [profiles, setProfiles] = useState<Map<string, NostrProfile>>(
    new Map(),
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const disposeFnRef = useRef<(() => void) | null>(null);

  const login = useCallback(async () => {
    if (!window.nostr) {
      throw new Error("NIP-07 extension not found");
    }
    setIsLoggingIn(true);
    try {
      const pk = await window.nostr.getPublicKey();
      setSignerPubkey(pk);
      localStorage.setItem("nostr_signer_pubkey", pk);
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(() => {
    setSignerPubkey(null);
    localStorage.removeItem("nostr_signer_pubkey");
  }, []);

  // Restore signer pubkey from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("nostr_signer_pubkey");
    if (saved) setSignerPubkey(saved);
  }, []);

  // Always build TL from owner's npub
  useEffect(() => {
    let disposed = false;

    (async () => {
      const {
        createRxNostr,
        createRxForwardReq,
        createRxBackwardReq,
      } = await import("rx-nostr");
      const { verifier } = await import("rx-nostr-crypto");
      const { nip19 } = await import("nostr-tools");

      if (disposed) return;

      const ownerHex = nip19.decode(OWNER_NPUB).data as string;

      const rxNostr = createRxNostr({ verifier });
      rxNostr.setDefaultRelays(NOSTR_RELAYS);
      disposeFnRef.current = () => rxNostr.dispose();

      // Fetch owner's contact list (kind:3)
      const followPubkeys: string[] = [];

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 10_000);
        const contactReq = createRxBackwardReq();
        rxNostr.use(contactReq).subscribe({
          next: (packet) => {
            for (const tag of packet.event.tags) {
              if (tag[0] === "p" && tag[1]) {
                followPubkeys.push(tag[1]);
              }
            }
          },
          complete: () => {
            clearTimeout(timeout);
            resolve();
          },
        });
        contactReq.emit([{ kinds: [3], authors: [ownerHex], limit: 1 }]);
        contactReq.over();
      });

      if (disposed) return;

      const authors = [ownerHex, ...followPubkeys];
      setFollows(followPubkeys);
      setIsConnected(true);

      if (authors.length === 0) return;

      // Fetch past notes
      const pastNotesReq = createRxBackwardReq();
      rxNostr.use(pastNotesReq).subscribe(handleNote);
      pastNotesReq.emit([{ kinds: [1], authors, limit: 50 }]);
      pastNotesReq.over();

      // Real-time notes
      const liveNotesReq = createRxForwardReq();
      rxNostr.use(liveNotesReq).subscribe(handleNote);
      liveNotesReq.emit([{ kinds: [1], authors }]);

      // Fetch profiles
      const profileReq = createRxBackwardReq();
      rxNostr.use(profileReq).subscribe((packet) => {
        try {
          const profile = JSON.parse(packet.event.content) as NostrProfile;
          setProfiles((prev) => {
            const next = new Map(prev);
            next.set(packet.event.pubkey, profile);
            return next;
          });
        } catch {
          /* ignore malformed profiles */
        }
      });
      profileReq.emit([{ kinds: [0], authors }]);
      profileReq.over();
    })();

    function handleNote(packet: { event: { id: string; pubkey: string; content: string; created_at: number } }) {
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
    }

    return () => {
      disposed = true;
      disposeFnRef.current?.();
      disposeFnRef.current = null;
      setIsConnected(false);
    };
  }, []);

  const [hasExtension, setHasExtension] = useState(false);
  useEffect(() => {
    setHasExtension(!!window.nostr);
  }, []);

  return {
    signerPubkey,
    follows,
    notes,
    profiles,
    isConnected,
    isLoggingIn,
    hasExtension,
    login,
    logout,
  };
}
