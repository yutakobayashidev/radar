import { useState, useEffect, useCallback } from "react";
import { useFetcher } from "react-router";
import { useInView } from "react-intersection-observer";
import { count, eq, desc, gte } from "drizzle-orm";
import type { Route } from "./+types/home";
import { AppLayout } from "~/components/layout";
import { CardGrid } from "~/components/feed";
import { categories, type FetchRadarItemsResponse, type RadarItemWithCategory, type Period } from "~/data/types";
import { radarItems, sources } from "../../db/schema";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Radar" },
    { name: "description", content: "Tech radar aggregator" },
  ];
}

const ITEMS_PER_PAGE = 20;

export async function loader({ context }: Route.LoaderArgs) {
  const [totalCountResult, items, sourcesData] = await Promise.all([
    context.db.select({ count: count() }).from(radarItems),
    context.db
      .select({
        id: radarItems.id,
        title: radarItems.title,
        source: radarItems.source,
        sourceName: radarItems.sourceName,
        summary: radarItems.summary,
        image: radarItems.image,
        url: radarItems.url,
        timestamp: radarItems.timestamp,
        createdAt: radarItems.createdAt,
        updatedAt: radarItems.updatedAt,
        category: sources.category,
      })
      .from(radarItems)
      .innerJoin(sources, eq(radarItems.source, sources.id))
      .orderBy(desc(radarItems.timestamp))
      .limit(ITEMS_PER_PAGE),
    context.db.query.sources.findMany({
      orderBy: (sources, { asc }) => [asc(sources.name)],
    }),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;
  const hasMore = items.length < totalCount;

  return {
    radarItems: items,
    sources: sourcesData,
    hasMore,
    currentPage: 1,
  };
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
  const fetcher = useFetcher<FetchRadarItemsResponse>();

  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("All");

  // 状態管理を追加
  const [radarItems, setRadarItems] = useState<RadarItemWithCategory[]>(loaderData.radarItems);
  const [page, setPage] = useState(loaderData.currentPage);
  const [hasMore, setHasMore] = useState(loaderData.hasMore);
  const [isLoading, setIsLoading] = useState(false);

  // 新しいページのデータ取得
  const loadMore = useCallback(() => {
    if (hasMore && fetcher.state === "idle" && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      setIsLoading(true);
      fetcher.load(`/api/radar-items?page=${nextPage}`);
    }
  }, [hasMore, page, fetcher, isLoading]);

  // fetcher からデータが返ってきたら統合する
  useEffect(() => {
    const data = fetcher.data;
    if (data?.radarItems) {
      setRadarItems((prev) => [...prev, ...data.radarItems]);
      setHasMore(data.hasMore);
      setIsLoading(false);
    }
  }, [fetcher.data]);

  // Intersection Observer のセットアップ
  const { ref: observerRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Intersection Observer がトリガーされたら読み込み
  useEffect(() => {
    if (inView && hasMore && fetcher.state === "idle" && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, fetcher.state, loadMore, isLoading]);

  const filteredItems = radarItems
    .filter((f) => selectedSource === "all" || f.source === selectedSource)
    .filter((f) => selectedCategory === "All" || f.category === selectedCategory)
    .filter((f) => {
      if (selectedPeriod === "All") return true;
      const now = new Date();
      const itemDate = new Date(f.timestamp);
      if (selectedPeriod === "Today") {
        return itemDate.toDateString() === now.toDateString();
      }
      if (selectedPeriod === "Month") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return itemDate >= oneMonthAgo;
      }
      return true;
    });

  return (
    <AppLayout
      title="Radar"
      selectedSource={selectedSource}
      setSelectedSource={setSelectedSource}
      selectedPeriod={selectedPeriod}
      setSelectedPeriod={setSelectedPeriod}
      showSourceFilter={true}
      sources={loaderData.sources}
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

      {hasMore && (
        <div ref={observerRef} className="p-2.5 text-center">
          {isLoading && (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
