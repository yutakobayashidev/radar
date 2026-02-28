import { useState, useEffect, useCallback } from "react";
import { useFetcher, useSearchParams, Link } from "react-router";
import { useInView } from "react-intersection-observer";
import { count, eq, desc } from "drizzle-orm";
import type { Route } from "./+types/home";
import { AppLayout } from "~/components/layout";
import { CardGrid } from "~/components/feed";
import { categoryList, getCategoryBySlug, type FetchRadarItemsResponse, type RadarItemWithCategory, type Period, type Kind } from "~/data/types";
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
        categorySlug: sources.categorySlug,
        kind: sources.kind,
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

function CategoryFilter({ selectedCategorySlug }: { selectedCategorySlug: string }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 mt-3">
      {categoryList.map((cat) => (
        <Link
          key={cat.slug}
          to={cat.slug === "all" ? "/" : `/?category=${cat.slug}`}
          className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
            selectedCategorySlug === cat.slug
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-600"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<FetchRadarItemsResponse>();
  const [searchParams] = useSearchParams();

  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("All");
  const [selectedKind, setSelectedKind] = useState<Kind>("all");

  // URLからカテゴリーを取得
  const categorySlug = searchParams.get("category") || "all";
  const selectedCategory = getCategoryBySlug(categorySlug);

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
    .filter((f) => selectedCategory.slug === "all" || f.categorySlug === selectedCategory.slug)
    .filter((f) => selectedKind === "all" || f.kind === selectedKind)
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
      selectedKind={selectedKind}
      setSelectedKind={setSelectedKind}
      showSourceFilter={true}
      sources={loaderData.sources}
      headerContent={
        <CategoryFilter selectedCategorySlug={categorySlug} />
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
