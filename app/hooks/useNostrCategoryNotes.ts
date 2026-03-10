import { useEffect, useState, useRef } from "react";
import { NOSTR_RELAYS, OWNER_NPUB } from "~/data/nostr-config";
import { categoryList } from "~/data/types";
import type { NostrNote, NostrProfile } from "./useNostr";

const MAX_NOTES_PER_CATEGORY = 50;

export function useNostrCategoryNotes() {
  const [categoryNotes, setCategoryNotes] = useState<Map<string, NostrNote[]>>(new Map());
  const [profiles, setProfiles] = useState<Map<string, NostrProfile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const disposeFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let disposed = false;

    (async () => {
      const {
        createRxNostr,
        createRxBackwardReq,
        uniq,
      } = await import("rx-nostr");
      const { verifier } = await import("rx-nostr-crypto");
      const { nip19 } = await import("nostr-tools");

      if (disposed) return;

      const hex = nip19.decode(OWNER_NPUB).data as string;

      const rxNostr = createRxNostr({ verifier });
      rxNostr.setDefaultRelays(NOSTR_RELAYS);
      disposeFnRef.current = () => rxNostr.dispose();

      const validSlugs = new Set(categoryList.filter((c) => c.slug !== "all").map((c) => c.slug));

      // Fetch NIP-51 Lists (kind:30000)
      const lists = new Map<string, string[]>();
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 10_000);
        const listReq = createRxBackwardReq();
        rxNostr.use(listReq).pipe(uniq()).subscribe({
          next: (packet) => {
            const dTag = packet.event.tags.find((t: string[]) => t[0] === "d")?.[1];
            if (!dTag || !validSlugs.has(dTag)) return;
            const pubkeys = packet.event.tags
              .filter((t: string[]) => t[0] === "p" && t[1])
              .map((t: string[]) => t[1]);
            lists.set(dTag, pubkeys);
          },
          complete: () => {
            clearTimeout(timeout);
            resolve();
          },
        });
        listReq.emit([{ kinds: [30000], authors: [hex] }]);
        listReq.over();
      });

      if (disposed) return;

      // Collect all unique pubkeys across categories
      const allPubkeys = new Set<string>();
      const pubkeyToSlugs = new Map<string, string[]>();
      for (const [slug, pubkeys] of lists) {
        for (const pk of pubkeys) {
          allPubkeys.add(pk);
          const existing = pubkeyToSlugs.get(pk) ?? [];
          existing.push(slug);
          pubkeyToSlugs.set(pk, existing);
        }
      }

      if (allPubkeys.size === 0) {
        setIsLoading(false);
        return;
      }

      const authors = Array.from(allPubkeys);

      // Fetch profiles
      const handleProfile = (packet: { event: { pubkey: string; content: string } }) => {
        try {
          const profile = JSON.parse(packet.event.content) as NostrProfile;
          setProfiles((prev) => {
            if (prev.get(packet.event.pubkey)) return prev;
            const next = new Map(prev);
            next.set(packet.event.pubkey, profile);
            return next;
          });
        } catch {
          /* ignore */
        }
      };

      const profileReq = createRxBackwardReq();
      rxNostr.use(profileReq).pipe(uniq()).subscribe(handleProfile);
      profileReq.emit([{ kinds: [0], authors }]);
      profileReq.over();

      // Fetch notes and distribute to categories
      const notesByCategory = new Map<string, NostrNote[]>();
      for (const slug of lists.keys()) {
        notesByCategory.set(slug, []);
      }

      const handleNote = (packet: { event: { id: string; pubkey: string; content: string; created_at: number; tags: string[][] } }) => {
        const ev = packet.event;
        const slugs = pubkeyToSlugs.get(ev.pubkey);
        if (!slugs) return;

        const note: NostrNote = {
          id: ev.id,
          pubkey: ev.pubkey,
          content: ev.content,
          created_at: ev.created_at,
          tags: ev.tags,
        };

        setCategoryNotes((prev) => {
          const next = new Map(prev);
          for (const slug of slugs) {
            const existing = next.get(slug) ?? [];
            if (existing.some((n) => n.id === note.id)) continue;
            const updated = [note, ...existing];
            updated.sort((a, b) => b.created_at - a.created_at);
            next.set(slug, updated.slice(0, MAX_NOTES_PER_CATEGORY));
          }
          return next;
        });
      };

      const notesReq = createRxBackwardReq();
      rxNostr.use(notesReq).pipe(uniq()).subscribe({
        next: handleNote,
        complete: () => setIsLoading(false),
      });
      notesReq.emit([{ kinds: [1], authors, limit: 100 }]);
      notesReq.over();
    })();

    return () => {
      disposed = true;
      disposeFnRef.current?.();
      disposeFnRef.current = null;
    };
  }, []);

  return { categoryNotes, profiles, isLoading };
}
