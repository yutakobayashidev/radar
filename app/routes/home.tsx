import { useState } from "react";
import type { Route } from "./+types/home";
import { AppLayout } from "~/components/layout";
import { CardGrid } from "~/components/feed";
import { categories } from "~/data/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Radar" },
    { name: "description", content: "Tech radar aggregator" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const [radarItems, sources] = await Promise.all([
    context.db.query.radarItems.findMany({
      orderBy: (radarItems, { desc }) => [desc(radarItems.timestamp)],
    }),
    context.db.query.sources.findMany({
      orderBy: (sources, { asc }) => [asc(sources.name)],
    }),
  ]);

  return { radarItems, sources };
}

function CategoryFilter({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 mt-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
            selectedCategory === cat
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-600"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = loaderData.radarItems
    .filter((f) => selectedSource === "all" || f.source === selectedSource)
    .filter((f) => selectedCategory === "All" || f.category === selectedCategory);

  return (
    <AppLayout
      title="Radar"
      selectedSource={selectedSource}
      setSelectedSource={setSelectedSource}
      showSourceFilter={true}
      sources={loaderData.sources}
      radarItems={loaderData.radarItems}
      headerContent={
        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      }
    >
      <CardGrid items={filteredItems} />
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          該当する記事がありません
        </div>
      )}
    </AppLayout>
  );
}
