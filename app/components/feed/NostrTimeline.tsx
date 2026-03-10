import { formatRelativeTime } from "~/data/types";
import { LinkifiedText } from "./CardGrid";
import type { NostrNote, NostrProfile } from "~/hooks/useNostr";

interface NostrTimelineProps {
  notes: NostrNote[];
  profiles: Map<string, NostrProfile>;
}

export function NostrTimeline({ notes, profiles }: NostrTimelineProps) {
  return (
    <div className="max-w-2xl">
      {notes.map((note) => {
        const profile = profiles.get(note.pubkey);
        const displayName =
          profile?.display_name || profile?.name || note.pubkey.slice(0, 8);
        const timestamp = new Date(note.created_at * 1000);

        return (
          <div
            key={note.id}
            className="bg-white px-4 py-5 border-b border-gray-200"
          >
            <div className="flex items-start gap-3">
              {profile?.picture ? (
                <img
                  src={profile.picture}
                  alt=""
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-100 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-bold text-gray-900">
                    {displayName}
                  </span>
                  <span className="text-gray-400">&middot;</span>
                  <span className="text-gray-400">
                    {formatRelativeTime(timestamp)}
                  </span>
                </div>
                <p className="text-[15px] text-gray-900 mt-0.5 whitespace-pre-line leading-relaxed">
                  <LinkifiedText text={note.content} />
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
