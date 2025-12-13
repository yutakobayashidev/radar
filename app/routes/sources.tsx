import type { Route } from "./+types/sources";
import { AppLayout } from "~/components/layout";
import { SourcesGrid } from "~/components/sources";
import { sources } from "~/data/mock";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sources - Feed" },
    { name: "description", content: "お世話になってるサイト" },
  ];
}

export default function Sources() {
  return (
    <AppLayout title="お世話になってるサイト">
      <SourcesGrid sources={sources} />
    </AppLayout>
  );
}
