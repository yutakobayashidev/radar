import type { ReactNode } from "react";
import { formatRelativeTime } from "~/data/types";
import { LinkifiedText } from "./CardGrid";
import type { NostrNote, NostrProfile } from "~/hooks/useNostr";

interface NostrNoteCardProps {
  note: NostrNote;
  profile?: NostrProfile;
}

export function NostrNoteCard({ note, profile }: NostrNoteCardProps) {
  const displayName =
    profile?.display_name || profile?.name || note.pubkey.slice(0, 8);
  const timestamp = new Date(note.created_at * 1000);
  const hashtags = note.tags.filter((t) => t[0] === "t").map((t) => t[1]);

  return (
    <div className="bg-white px-3 py-4 border-b border-gray-100">
      <div className="flex items-start gap-2.5">
        {profile?.picture ? (
          <img
            src={profile.picture}
            alt=""
            className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex-shrink-0 mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="font-medium text-gray-900 truncate">
              {displayName}
            </span>
            <span>&middot;</span>
            <span className="flex-shrink-0">
              {formatRelativeTime(timestamp)}
            </span>
          </div>
          <p className="text-sm text-gray-800 mt-1 whitespace-pre-line line-clamp-6 leading-relaxed">
            <LinkifiedText text={note.content} />
          </p>
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface NostrTimelineProps {
  notes: NostrNote[];
  profiles: Map<string, NostrProfile>;
}

export function NostrTimeline({ notes, profiles }: NostrTimelineProps) {
  return (
    <div>
      {notes.map((note) => (
        <NostrNoteCard
          key={note.id}
          note={note}
          profile={profiles.get(note.pubkey)}
        />
      ))}
    </div>
  );
}

interface NostrDeckColumnProps {
  title: string;
  notes: NostrNote[];
  profiles: Map<string, NostrProfile>;
  headerContent?: ReactNode;
}

export function NostrDeckColumn({ title, notes, profiles, headerContent }: NostrDeckColumnProps) {
  return (
    <div className="flex flex-col h-full w-96 flex-shrink-0 bg-white overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 bg-white text-gray-900">
        <span className="text-sm font-semibold">{title}</span>
      </div>
      {headerContent}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400">
            No notes yet
          </div>
        ) : (
          notes.map((note) => (
            <NostrNoteCard
              key={note.id}
              note={note}
              profile={profiles.get(note.pubkey)}
            />
          ))
        )}
      </div>
    </div>
  );
}
