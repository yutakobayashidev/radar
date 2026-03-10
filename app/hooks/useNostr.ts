import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { NOSTR_RELAYS, OWNER_NPUB } from "~/data/nostr-config";
import { categoryList } from "~/data/types";

export interface NostrNote {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  tags: string[][];
}

export interface NostrProfile {
  name?: string;
  display_name?: string;
  picture?: string;
  about?: string;
}

export interface NoteStats {
  reactions: number;
  reposts: number;
}

export interface NostrNotification {
  id: string;
  kind: number;
  pubkey: string;
  content: string;
  created_at: number;
  tags: string[][];
  targetNoteId?: string;
}

export interface NostrReaction {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  targetNoteId: string;
}

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: unknown): Promise<unknown>;
    };
  }
}

const MAX_NOTES = 200;

function addNote(
  prev: NostrNote[],
  ev: { id: string; pubkey: string; content: string; created_at: number; tags: string[][] },
) {
  if (prev.some((n) => n.id === ev.id)) return prev;
  const next = [
    { id: ev.id, pubkey: ev.pubkey, content: ev.content, created_at: ev.created_at, tags: ev.tags },
    ...prev,
  ];
  next.sort((a, b) => b.created_at - a.created_at);
  return next.slice(0, MAX_NOTES);
}

export function useNostr() {
  const [signerPubkey, setSignerPubkey] = useState<string | null>(null);
  const [ownerHex, setOwnerHex] = useState<string | null>(null);
  const [follows, setFollows] = useState<string[]>([]);
  const [notes, setNotes] = useState<NostrNote[]>([]);
  const [globalNotes, setGlobalNotes] = useState<NostrNote[]>([]);
  const [notifications, setNotifications] = useState<NostrNotification[]>([]);
  const [reactions, setReactions] = useState<NostrReaction[]>([]);
  const [noteStats, setNoteStats] = useState<Map<string, NoteStats>>(new Map());
  const [categoryLists, setCategoryLists] = useState<Map<string, string[]>>(new Map());
  const [profiles, setProfiles] = useState<Map<string, NostrProfile>>(
    new Map(),
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const disposeFnRef = useRef<(() => void) | null>(null);
  const rxNostrRef = useRef<{ send: (event: unknown) => unknown } | null>(null);

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

  useEffect(() => {
    const saved = localStorage.getItem("nostr_signer_pubkey");
    if (saved) setSignerPubkey(saved);
  }, []);

  useEffect(() => {
    let disposed = false;

    (async () => {
      const {
        createRxNostr,
        createRxForwardReq,
        createRxBackwardReq,
        batch,
        uniq,
      } = await import("rx-nostr");
      const { verifier } = await import("rx-nostr-crypto");
      const { nip19 } = await import("nostr-tools");
      const { bufferWhen, interval } = await import("rxjs");

      if (disposed) return;

      const hex = nip19.decode(OWNER_NPUB).data as string;
      setOwnerHex(hex);

      const rxNostr = createRxNostr({ verifier });
      rxNostr.setDefaultRelays(NOSTR_RELAYS);
      rxNostrRef.current = rxNostr;
      disposeFnRef.current = () => {
        rxNostr.dispose();
        rxNostrRef.current = null;
      };

      // Shared profile handler
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
          /* ignore malformed */
        }
      };

      // Batched profile fetcher for unknown pubkeys
      const fetchedProfilePubkeys = new Set<string>();
      const profileBatchReq = createRxForwardReq();
      rxNostr
        .use(
          profileBatchReq.pipe(
            bufferWhen(() => interval(1000)),
            batch(),
          ),
        )
        .pipe(uniq())
        .subscribe({ next: handleProfile });

      const ensureProfile = (pubkey: string) => {
        if (fetchedProfilePubkeys.has(pubkey)) return;
        fetchedProfilePubkeys.add(pubkey);
        profileBatchReq.emit([{ kinds: [0], authors: [pubkey], limit: 1 }]);
      };

      // Fetch contact list (kind:3)
      const followPubkeys: string[] = [];

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 10_000);
        const contactReq = createRxBackwardReq();
        rxNostr.use(contactReq).pipe(uniq()).subscribe({
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
        contactReq.emit([{ kinds: [3], authors: [hex], limit: 1 }]);
        contactReq.over();
      });

      if (disposed) return;

      // Fetch NIP-51 Lists (kind:30000) for category tagging
      const validSlugs = new Set(categoryList.filter((c) => c.slug !== "all").map((c) => c.slug));
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 10_000);
        const listReq = createRxBackwardReq();
        const lists = new Map<string, string[]>();
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
      setCategoryLists(lists);

      const authors = [hex, ...followPubkeys];
      setFollows(followPubkeys);
      setIsConnected(true);

      // Pre-register all followed authors for profile fetching
      for (const a of authors) fetchedProfilePubkeys.add(a);

      if (authors.length === 0) return;

      // Note handler: add note + ensure profile is fetched
      const handleNote = (packet: { event: { id: string; pubkey: string; content: string; created_at: number; tags: string[][] } }) => {
        setNotes((prev) => addNote(prev, packet.event));
        ensureProfile(packet.event.pubkey);
      };

      // Past notes (followed) with dedup
      const pastReq = createRxBackwardReq();
      rxNostr.use(pastReq).pipe(uniq()).subscribe(handleNote);
      pastReq.emit([{ kinds: [1], authors, limit: 50 }]);
      pastReq.over();

      // Real-time notes (followed) with dedup
      const liveReq = createRxForwardReq();
      rxNostr.use(liveReq).pipe(uniq()).subscribe(handleNote);
      liveReq.emit([{ kinds: [1], authors }]);

      // Profiles for followed authors (bulk fetch with dedup)
      const profileReq = createRxBackwardReq();
      rxNostr.use(profileReq).pipe(uniq()).subscribe(handleProfile);
      profileReq.emit([{ kinds: [0], authors }]);
      profileReq.over();

      // Reactions & reposts (kind:7 and kind:6) for followed authors' notes
      const handleReaction = (packet: { event: { tags: string[][]; kind: number } }) => {
        const eTag = packet.event.tags.find((t) => t[0] === "e");
        if (!eTag?.[1]) return;
        const noteId = eTag[1];
        setNoteStats((prev) => {
          const existing = prev.get(noteId) ?? { reactions: 0, reposts: 0 };
          const next = new Map(prev);
          if (packet.event.kind === 7) {
            next.set(noteId, { ...existing, reactions: existing.reactions + 1 });
          } else if (packet.event.kind === 6) {
            next.set(noteId, { ...existing, reposts: existing.reposts + 1 });
          }
          return next;
        });
      };

      const reactionReq = createRxBackwardReq();
      rxNostr.use(reactionReq).pipe(uniq()).subscribe(handleReaction);
      reactionReq.emit([{ kinds: [7, 6], "#p": authors, limit: 100 }]);
      reactionReq.over();

      const liveReactionReq = createRxForwardReq();
      rxNostr.use(liveReactionReq).pipe(uniq()).subscribe(handleReaction);
      liveReactionReq.emit([{ kinds: [7, 6], "#p": authors }]);

      // Global feed with dedup
      const handleGlobalNote = (packet: { event: { id: string; pubkey: string; content: string; created_at: number; tags: string[][] } }) => {
        setGlobalNotes((prev) => addNote(prev, packet.event));
        ensureProfile(packet.event.pubkey);
      };

      const globalPastReq = createRxBackwardReq();
      rxNostr.use(globalPastReq).pipe(uniq()).subscribe(handleGlobalNote);
      globalPastReq.emit([{ kinds: [1], limit: 50 }]);
      globalPastReq.over();

      const globalLiveReq = createRxForwardReq();
      rxNostr.use(globalLiveReq).pipe(uniq()).subscribe(handleGlobalNote);
      globalLiveReq.emit([{ kinds: [1] }]);

      // Notifications: mentions (kind:1 with p-tag) + reactions/reposts to owner's notes
      const addNotification = (ev: { id: string; kind: number; pubkey: string; content: string; created_at: number; tags: string[][] }) => {
        const targetNoteId = ev.tags.find((t) => t[0] === "e")?.[1];
        setNotifications((prev) => {
          if (prev.some((n) => n.id === ev.id)) return prev;
          const next = [{ ...ev, targetNoteId }, ...prev];
          next.sort((a, b) => b.created_at - a.created_at);
          return next.slice(0, MAX_NOTES);
        });
        ensureProfile(ev.pubkey);
      };

      const handleNotification = (packet: { event: { id: string; kind: number; pubkey: string; content: string; created_at: number; tags: string[][] } }) => {
        if (packet.event.pubkey === hex) return; // skip own actions
        addNotification(packet.event);
      };

      // Mentions: kind:1 where owner is p-tagged
      const mentionPastReq = createRxBackwardReq();
      rxNostr.use(mentionPastReq).pipe(uniq()).subscribe(handleNotification);
      mentionPastReq.emit([{ kinds: [1], "#p": [hex], limit: 30 }]);
      mentionPastReq.over();

      const mentionLiveReq = createRxForwardReq();
      rxNostr.use(mentionLiveReq).pipe(uniq()).subscribe(handleNotification);
      mentionLiveReq.emit([{ kinds: [1], "#p": [hex] }]);

      // Reactions/reposts directed at owner (kind:7, kind:6)
      const notifReactionPastReq = createRxBackwardReq();
      rxNostr.use(notifReactionPastReq).pipe(uniq()).subscribe(handleNotification);
      notifReactionPastReq.emit([{ kinds: [7, 6], "#p": [hex], limit: 50 }]);
      notifReactionPastReq.over();

      const notifReactionLiveReq = createRxForwardReq();
      rxNostr.use(notifReactionLiveReq).pipe(uniq()).subscribe(handleNotification);
      notifReactionLiveReq.emit([{ kinds: [7, 6], "#p": [hex] }]);

      // Reactions deck: all kind:7 events on followed TL
      const addReaction = (ev: { id: string; pubkey: string; content: string; created_at: number; tags: string[][] }) => {
        const targetNoteId = ev.tags.find((t) => t[0] === "e")?.[1];
        if (!targetNoteId) return;
        setReactions((prev) => {
          if (prev.some((r) => r.id === ev.id)) return prev;
          const next = [{ id: ev.id, pubkey: ev.pubkey, content: ev.content, created_at: ev.created_at, targetNoteId }, ...prev];
          next.sort((a, b) => b.created_at - a.created_at);
          return next.slice(0, MAX_NOTES);
        });
        ensureProfile(ev.pubkey);
      };

      const handleReactionEvent = (packet: { event: { id: string; pubkey: string; content: string; created_at: number; tags: string[][] } }) => {
        addReaction(packet.event);
      };

      const reactionDeckPastReq = createRxBackwardReq();
      rxNostr.use(reactionDeckPastReq).pipe(uniq()).subscribe(handleReactionEvent);
      reactionDeckPastReq.emit([{ kinds: [7], "#p": authors, limit: 50 }]);
      reactionDeckPastReq.over();

      const reactionDeckLiveReq = createRxForwardReq();
      rxNostr.use(reactionDeckLiveReq).pipe(uniq()).subscribe(handleReactionEvent);
      reactionDeckLiveReq.emit([{ kinds: [7], "#p": authors }]);
    })();

    return () => {
      disposed = true;
      disposeFnRef.current?.();
      disposeFnRef.current = null;
      setIsConnected(false);
    };
  }, []);

  // Derived data for deck columns
  const myNotes = useMemo(
    () => (ownerHex ? notes.filter((n) => n.pubkey === ownerHex) : []),
    [notes, ownerHex],
  );

  const timelineNotes = useMemo(
    () => (ownerHex ? notes.filter((n) => n.pubkey !== ownerHex) : notes),
    [notes, ownerHex],
  );

  const taggedNotes = useMemo(
    () => notes.filter((n) => n.tags.some((t) => t[0] === "t")),
    [notes],
  );

  const isOwner = !!(signerPubkey && ownerHex && signerPubkey === ownerHex);

  const publish = useCallback(async (content: string) => {
    if (!window.nostr || !rxNostrRef.current || !isOwner) {
      throw new Error("Cannot publish: not logged in as owner");
    }
    setIsPublishing(true);
    try {
      const unsignedEvent = {
        kind: 1,
        content,
        tags: [] as string[][],
        created_at: Math.floor(Date.now() / 1000),
      };
      const signedEvent = await window.nostr.signEvent(unsignedEvent);
      rxNostrRef.current.send(signedEvent);
      // Optimistically add to local notes
      const ev = signedEvent as { id: string; pubkey: string; content: string; created_at: number; tags: string[][] };
      setNotes((prev) => addNote(prev, ev));
    } finally {
      setIsPublishing(false);
    }
  }, [isOwner]);

  const updateCategoryList = useCallback(async (slug: string, pubkeys: string[]) => {
    if (!window.nostr || !rxNostrRef.current || !isOwner) {
      throw new Error("Cannot update list: not logged in as owner");
    }
    const unsignedEvent = {
      kind: 30000,
      content: "",
      tags: [
        ["d", slug],
        ...pubkeys.map((pk) => ["p", pk]),
      ],
      created_at: Math.floor(Date.now() / 1000),
    };
    const signedEvent = await window.nostr.signEvent(unsignedEvent);
    rxNostrRef.current.send(signedEvent);
    setCategoryLists((prev) => {
      const next = new Map(prev);
      next.set(slug, pubkeys);
      return next;
    });
  }, [isOwner]);

  const addToCategory = useCallback(async (slug: string, pubkey: string) => {
    const current = categoryLists.get(slug) ?? [];
    if (current.includes(pubkey)) return;
    await updateCategoryList(slug, [...current, pubkey]);
  }, [categoryLists, updateCategoryList]);

  const removeFromCategory = useCallback(async (slug: string, pubkey: string) => {
    const current = categoryLists.get(slug) ?? [];
    if (!current.includes(pubkey)) return;
    await updateCategoryList(slug, current.filter((pk) => pk !== pubkey));
  }, [categoryLists, updateCategoryList]);

  const getUserCategories = useCallback((pubkey: string): string[] => {
    const result: string[] = [];
    for (const [slug, pubkeys] of categoryLists) {
      if (pubkeys.includes(pubkey)) result.push(slug);
    }
    return result;
  }, [categoryLists]);

  const [hasExtension, setHasExtension] = useState(false);
  useEffect(() => {
    setHasExtension(!!window.nostr);
  }, []);

  return {
    signerPubkey,
    ownerHex,
    follows,
    notes,
    globalNotes,
    notifications,
    reactions,
    myNotes,
    timelineNotes,
    taggedNotes,
    noteStats,
    profiles,
    isConnected,
    isLoggingIn,
    isOwner,
    isPublishing,
    hasExtension,
    categoryLists,
    login,
    logout,
    publish,
    addToCategory,
    removeFromCategory,
    getUserCategories,
  };
}
