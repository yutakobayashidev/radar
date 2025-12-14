import type { Route } from "./+types/sources";
import { AppLayout } from "~/components/layout";
import { SourcesGrid } from "~/components/sources";
import { sources } from "~/data/mock";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sources - Radar" },
    { name: "description", content: "お世話になってるソース一覧" },
  ];
}

export default function Sources() {
  return (
    <AppLayout title="お世話になってるソース一覧">
      <SourcesGrid sources={sources} />
    </AppLayout>
  );
}
