import type { ReactNode } from "react";
import { formatRelativeTime } from "~/data/types";
import { LinkifiedText } from "./CardGrid";
import type { NostrNote, NostrProfile, NoteStats, NostrNotification, NostrReaction } from "~/hooks/useNostr";

interface NostrNoteCardProps {
  note: NostrNote;
  profile?: NostrProfile;
  stats?: NoteStats;
}

export function NostrNoteCard({ note, profile, stats }: NostrNoteCardProps) {
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
          <p className="text-sm text-gray-800 mt-1 whitespace-pre-line leading-relaxed">
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
          {stats && (stats.reactions > 0 || stats.reposts > 0) && (
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              {stats.reposts > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {stats.reposts}
                </span>
              )}
              {stats.reactions > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {stats.reactions}
                </span>
              )}
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
  noteStats?: Map<string, NoteStats>;
}

export function NostrTimeline({ notes, profiles, noteStats }: NostrTimelineProps) {
  return (
    <div>
      {notes.map((note) => (
        <NostrNoteCard
          key={note.id}
          note={note}
          profile={profiles.get(note.pubkey)}
          stats={noteStats?.get(note.id)}
        />
      ))}
    </div>
  );
}

interface NostrDeckColumnProps {
  title: string;
  notes: NostrNote[];
  profiles: Map<string, NostrProfile>;
  noteStats?: Map<string, NoteStats>;
  headerContent?: ReactNode;
}

function NotificationIcon({ kind }: { kind: number }) {
  if (kind === 7) {
    return (
      <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  }
  if (kind === 6) {
    return (
      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    );
  }
  // kind 1 = mention
  return (
    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9" />
    </svg>
  );
}

function NotificationCard({ notification, profile }: { notification: NostrNotification; profile?: NostrProfile }) {
  const displayName = profile?.display_name || profile?.name || notification.pubkey.slice(0, 8);
  const timestamp = new Date(notification.created_at * 1000);
  const label = notification.kind === 7 ? "reacted" : notification.kind === 6 ? "reposted" : "mentioned you";

  return (
    <div className="bg-white px-3 py-3 border-b border-gray-100">
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5">
          <NotificationIcon kind={notification.kind} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs">
            {profile?.picture && (
              <img src={profile.picture} alt="" className="w-5 h-5 rounded-full" />
            )}
            <span className="font-medium text-gray-900 truncate">{displayName}</span>
            <span className="text-gray-400">{label}</span>
            <span className="text-gray-400">&middot;</span>
            <span className="text-gray-400 flex-shrink-0">{formatRelativeTime(timestamp)}</span>
          </div>
          {notification.kind === 1 && notification.content && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-3">
              <LinkifiedText text={notification.content} />
            </p>
          )}
          {notification.kind === 7 && notification.content && notification.content !== "+" && (
            <p className="text-sm mt-0.5">{notification.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReactionCard({ reaction, profile }: { reaction: NostrReaction; profile?: NostrProfile }) {
  const displayName = profile?.display_name || profile?.name || reaction.pubkey.slice(0, 8);
  const timestamp = new Date(reaction.created_at * 1000);
  const emoji = reaction.content === "+" ? "❤️" : reaction.content || "❤️";

  return (
    <div className="bg-white px-3 py-3 border-b border-gray-100">
      <div className="flex items-center gap-2.5">
        <span className="text-base flex-shrink-0">{emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs">
            {profile?.picture && (
              <img src={profile.picture} alt="" className="w-5 h-5 rounded-full" />
            )}
            <span className="font-medium text-gray-900 truncate">{displayName}</span>
            <span className="text-gray-400">&middot;</span>
            <span className="text-gray-400 flex-shrink-0">{formatRelativeTime(timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NostrNotificationColumnProps {
  title: string;
  notifications: NostrNotification[];
  profiles: Map<string, NostrProfile>;
}

export function NostrNotificationColumn({ title, notifications, profiles }: NostrNotificationColumnProps) {
  return (
    <div className="flex flex-col h-full w-96 flex-shrink-0 bg-white overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 bg-white text-gray-900">
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} profile={profiles.get(n.pubkey)} />
          ))
        )}
      </div>
    </div>
  );
}

interface NostrReactionColumnProps {
  title: string;
  reactions: NostrReaction[];
  profiles: Map<string, NostrProfile>;
}

export function NostrReactionColumn({ title, reactions, profiles }: NostrReactionColumnProps) {
  return (
    <div className="flex flex-col h-full w-96 flex-shrink-0 bg-white overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 bg-white text-gray-900">
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {reactions.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400">
            No reactions yet
          </div>
        ) : (
          reactions.map((r) => (
            <ReactionCard key={r.id} reaction={r} profile={profiles.get(r.pubkey)} />
          ))
        )}
      </div>
    </div>
  );
}

export function NostrDeckColumn({ title, notes, profiles, noteStats, headerContent }: NostrDeckColumnProps) {
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
              stats={noteStats?.get(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
