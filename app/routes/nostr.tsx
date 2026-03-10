import { AppLayout } from "~/components/layout";
import { NostrTimeline } from "~/components/feed";
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
    pubkey,
    follows,
    notes,
    profiles,
    isConnected,
    isLoading,
    hasExtension,
    login,
    logout,
  } = useNostr();

  return (
    <AppLayout title="Nostr">
      {!pubkey ? (
        <div className="text-center py-12">
          {hasExtension ? (
            <div>
              <p className="text-gray-500 mb-4">
                Sign in with your Nostr extension to see your timeline.
              </p>
              <button
                onClick={login}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {isLoading ? "Connecting..." : "Login with NIP-07"}
              </button>
            </div>
          ) : (
            <p className="text-gray-500">
              Install a NIP-07 browser extension (nos2x, Alby, etc.) to use
              Nostr.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 text-sm text-gray-500">
            <span>
              Following {follows.length} accounts
            </span>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Logout
            </button>
          </div>
          {!isConnected && (
            <div className="text-center py-12 text-gray-500">
              Fetching contact list...
            </div>
          )}
          {isConnected && notes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Waiting for notes...
            </div>
          )}
          {notes.length > 0 && (
            <NostrTimeline notes={notes} profiles={profiles} />
          )}
        </>
      )}
    </AppLayout>
  );
}
