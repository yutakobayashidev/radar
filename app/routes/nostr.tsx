import { AppLayout } from "~/components/layout";
import { NostrDeckColumn } from "~/components/feed";
import { useNostr } from "~/hooks/useNostr";
import type { Route } from "./+types/nostr";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nostr - Radar" },
    { name: "description", content: "Nostr feed" },
  ];
}

export default function Nostr() {
  const {
    signerPubkey,
    myNotes,
    timelineNotes,
    taggedNotes,
    globalNotes,
    profiles,
    isConnected,
    isLoggingIn,
    hasExtension,
    login,
    logout,
  } = useNostr();

  return (
    <AppLayout title="Nostr">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 text-sm text-gray-500">
        <span />
        {hasExtension && (
          signerPubkey ? (
            <button
              onClick={logout}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={login}
              disabled={isLoggingIn}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? "Connecting..." : "Login with NIP-07"}
            </button>
          )
        )}
      </div>
      {!isConnected ? (
        <div className="text-center py-12 text-gray-500">
          Connecting to relays...
        </div>
      ) : (
        <div className="flex gap-px h-[calc(100vh-7rem)] overflow-x-auto snap-x snap-mandatory bg-gray-200">
          <NostrDeckColumn
            title="My Notes"
            notes={myNotes}
            profiles={profiles}
          />
          <NostrDeckColumn
            title="Timeline"
            notes={timelineNotes}
            profiles={profiles}
          />
          <NostrDeckColumn
            title="Tagged"
            notes={taggedNotes}
            profiles={profiles}
          />
          <NostrDeckColumn
            title="Global"
            notes={globalNotes}
            profiles={profiles}
          />
        </div>
      )}
    </AppLayout>
  );
}
