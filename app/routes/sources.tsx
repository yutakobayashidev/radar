import type { Route } from "./+types/sources";
import { AppLayout } from "~/components/layout";
import { SourcesGrid } from "~/components/sources";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sources - Radar" },
    { name: "description", content: "お世話になってるソース一覧" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const sources = await context.db.query.sources.findMany({
    orderBy: (sources, { asc }) => [asc(sources.name)],
  });

  return { sources };
}

export default function Sources({ loaderData }: Route.ComponentProps) {
  return (
    <AppLayout title="お世話になってるソース一覧">
      <SourcesGrid sources={loaderData.sources} />
    </AppLayout>
  );
}
