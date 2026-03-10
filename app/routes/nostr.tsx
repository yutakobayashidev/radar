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
    ownerHex,
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
            headerContent={myNotesHeader}
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
