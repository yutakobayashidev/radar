import { useState } from "react";
import { AppLayout } from "~/components/layout";
import { NostrDeckColumn, NostrNotificationColumn, NostrReactionColumn } from "~/components/feed";
import { useNostr } from "~/hooks/useNostr";
import type { Route } from "./+types/nostr";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nostr - Radar" },
    { name: "description", content: "Nostr feed" },
  ];
}

function ComposeForm({
  onPublish,
  isPublishing,
}: {
  onPublish: (content: string) => Promise<void>;
  isPublishing: boolean;
}) {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    await onPublish(text);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="px-3 py-2 border-b border-gray-200">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className="w-full text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
      />
      <div className="flex justify-end mt-1.5">
        <button
          type="submit"
          disabled={isPublishing || !content.trim()}
          className="px-3 py-1 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPublishing ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}

export default function Nostr() {
  const {
    signerPubkey,
    ownerHex,
    myNotes,
    timelineNotes,
    taggedNotes,
    globalNotes,
    notifications,
    reactions,
    noteStats,
    profiles,
    isConnected,
    isLoggingIn,
    isOwner,
    isPublishing,
    hasExtension,
    login,
    logout,
    publish,
  } = useNostr();

  const ownerProfile = ownerHex ? profiles.get(ownerHex) : undefined;

  const myNotesHeader = (
    <div className="border-b border-gray-200">
      {ownerProfile ? (
        <div className="px-3 py-3">
          <div className="flex items-center gap-2.5">
            {ownerProfile.picture ? (
              <img
                src={ownerProfile.picture}
                alt=""
                className="w-12 h-12 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-100 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-gray-900 truncate">
                {ownerProfile.display_name || ownerProfile.name}
              </div>
              {ownerProfile.name && ownerProfile.display_name && (
                <div className="text-xs text-gray-400 truncate">
                  @{ownerProfile.name}
                </div>
              )}
            </div>
          </div>
          {ownerProfile.about && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
              {ownerProfile.about}
            </p>
          )}
        </div>
      ) : (
        <div className="px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex-shrink-0 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
              <div className="h-2.5 bg-gray-100 rounded w-16 animate-pulse" />
            </div>
          </div>
        </div>
      )}
      {hasExtension && (
        <div className="px-3 pb-2">
          {signerPubkey ? (
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={login}
              disabled={isLoggingIn}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? "Connecting..." : "Login with NIP-07"}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <AppLayout title="Nostr" isDeckMode>
      {!isConnected ? (
        <div className="text-center py-12 text-gray-500">
          Connecting to relays...
        </div>
      ) : (
        <div className="flex gap-px h-full overflow-x-auto snap-x snap-mandatory bg-gray-200">
          <NostrDeckColumn
            title="My Notes"
            notes={myNotes}
            profiles={profiles}
            noteStats={noteStats}
            headerContent={
              <>
                {myNotesHeader}
                {isOwner && (
                  <ComposeForm onPublish={publish} isPublishing={isPublishing} />
                )}
              </>
            }
          />
          <NostrDeckColumn
            title="Timeline"
            notes={timelineNotes}
            profiles={profiles}
            noteStats={noteStats}
          />
          <NostrDeckColumn
            title="Tagged"
            notes={taggedNotes}
            profiles={profiles}
            noteStats={noteStats}
          />
          <NostrNotificationColumn
            title="Notifications"
            notifications={notifications}
            profiles={profiles}
          />
          <NostrReactionColumn
            title="Reactions"
            reactions={reactions}
            profiles={profiles}
          />
          <NostrDeckColumn
            title="Global"
            notes={globalNotes}
            profiles={profiles}
            noteStats={noteStats}
          />
        </div>
      )}
    </AppLayout>
  );
}
