import { Link } from "react-router";
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
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Feedに戻る
        </Link>
      </div>
      <SourcesGrid sources={sources} />
    </AppLayout>
  );
}
