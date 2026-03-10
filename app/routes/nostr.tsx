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
    signerPubkey,
    follows,
    notes,
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
        <span>Following {follows.length} accounts</span>
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
      {!isConnected && (
        <div className="text-center py-12 text-gray-500">
          Connecting to relays...
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
    </AppLayout>
  );
}
