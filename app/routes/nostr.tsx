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
  const { notes, profiles, isConnected } = useNostr();

  return (
    <AppLayout title="Nostr">
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
