import { useState } from "react";
import type { Route } from "./+types/sources";
import { Header } from "../components/ui";
import { SourceList, AddSourceForm, type SourceData } from "../components/source";
import { mockSources } from "../data/mock";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sources - Feed App" },
    { name: "description", content: "Manage your feed sources" },
  ];
}

export default function Sources() {
  const [sources, setSources] = useState<SourceData[]>(mockSources);

  const handleAddSource = (url: string) => {
    const newSource: SourceData = {
      id: String(Date.now()),
      name: new URL(url).hostname,
      url,
      type: "rss",
      itemCount: 0,
    };
    setSources([newSource, ...sources]);
  };

  const handleRemoveSource = (id: string) => {
    setSources(sources.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sources
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your RSS feeds and sources
          </p>
        </div>
        <div className="mb-6">
          <AddSourceForm onAdd={handleAddSource} />
        </div>
        <SourceList sources={sources} onRemove={handleRemoveSource} />
      </main>
    </div>
  );
}
