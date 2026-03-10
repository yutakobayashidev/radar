import { useEffect, useRef, useState } from "react";
import { NOSTR_RELAYS, NOSTR_FOLLOWS } from "~/data/nostr-config";

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

const MAX_NOTES = 100;

export function useNostr() {
  const [notes, setNotes] = useState<NostrNote[]>([]);
  const [profiles, setProfiles] = useState<Map<string, NostrProfile>>(
    new Map(),
  );
  const [isConnected, setIsConnected] = useState(false);
  const disposeFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (NOSTR_FOLLOWS.length === 0) {
      setIsConnected(true);
      return;
    }

    let disposed = false;

    (async () => {
      const { createRxNostr, createRxForwardReq } = await import("rx-nostr");
      const { verifier } = await import("rx-nostr-crypto");
      const { nip19 } = await import("nostr-tools");

      if (disposed) return;

      const hexPubkeys = NOSTR_FOLLOWS.map((f) => {
        const decoded = nip19.decode(f.npub);
        return decoded.data as string;
      });

      const rxNostr = createRxNostr({ verifier });
      rxNostr.setDefaultRelays(NOSTR_RELAYS);
      setIsConnected(true);

      disposeFnRef.current = () => rxNostr.dispose();

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
      notesReq.emit([{ kinds: [1], authors: hexPubkeys, limit: 50 }]);

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
      profileReq.emit([{ kinds: [0], authors: hexPubkeys }]);
    })();

    return () => {
      disposed = true;
      disposeFnRef.current?.();
      setIsConnected(false);
    };
  }, []);

  return { notes, profiles, isConnected };
}
