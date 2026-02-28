import { useState, useEffect, useCallback, useRef } from "react";
import { useFetcher, useSearchParams, Link } from "react-router";
import { useInView } from "react-intersection-observer";
import { count, eq, desc, and, type SQL } from "drizzle-orm";
import type { Route } from "./+types/home";
import { AppLayout } from "~/components/layout";
import { CardGrid } from "~/components/feed";
import { Favicon } from "~/components/ui";
import { categoryList, getDomainFromUrl, type FetchRadarItemsResponse, type RadarItemWithCategory, type Period, type Kind } from "~/data/types";
import { radarItems, sources } from "../../db/schema";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Radar" },
    { name: "description", content: "Tech radar aggregator" },
  ];
}

const ITEMS_PER_PAGE = 20;

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const categoryParam = url.searchParams.get("category");

  const conditions: SQL[] = [];
  if (categoryParam && categoryParam !== "all") {
    conditions.push(eq(sources.categorySlug, categoryParam));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalCountResult, items, sourcesData] = await Promise.all([
    context.db
      .select({ count: count() })
      .from(radarItems)
      .innerJoin(sources, eq(radarItems.source, sources.id))
      .where(whereClause),
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
      .where(whereClause)
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
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("All");
  const [selectedKind, setSelectedKind] = useState<Kind>("all");

  const categorySlug = searchParams.get("category") || "all";

  const handleSourceChange = useCallback((source: string) => {
    if (source !== "all") {
      setSelectedKind("all");
      setSearchParams({}, { replace: true });
    }
    setSelectedSource(source);
  }, [setSearchParams]);

  const [items, setItems] = useState<RadarItemWithCategory[]>(loaderData.radarItems);
  const [page, setPage] = useState(loaderData.currentPage);
  const [hasMore, setHasMore] = useState(loaderData.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const isResetRef = useRef(false);

  // loaderData が変わったら同期（カテゴリーナビゲーション時）
  useEffect(() => {
    if (selectedKind === "all" && selectedSource === "all") {
      setItems(loaderData.radarItems);
      setPage(loaderData.currentPage);
      setHasMore(loaderData.hasMore);
      setIsLoading(false);
    } else {
      setItems([]);
      setPage(1);
      setHasMore(true);
      setIsLoading(true);
      isResetRef.current = true;
      const params = new URLSearchParams({ page: "1" });
      if (selectedKind !== "all") params.set("kind", selectedKind);
      if (categorySlug !== "all") params.set("category", categorySlug);
      if (selectedSource !== "all") params.set("source", selectedSource);
      fetcher.load(`/api/radar-items?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderData]);

  // kind/source フィルタ変更時、サーバーから再取得
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setItems([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(true);
    isResetRef.current = true;
    const params = new URLSearchParams({ page: "1" });
    if (selectedKind !== "all") params.set("kind", selectedKind);
    if (categorySlug !== "all") params.set("category", categorySlug);
    if (selectedSource !== "all") params.set("source", selectedSource);
    fetcher.load(`/api/radar-items?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKind, selectedSource]);

  // 無限スクロール: 次ページ読み込み
  const loadMore = useCallback(() => {
    if (hasMore && fetcher.state === "idle" && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      setIsLoading(true);
      isResetRef.current = false;
      const params = new URLSearchParams({ page: String(nextPage) });
      if (selectedKind !== "all") params.set("kind", selectedKind);
      if (categorySlug !== "all") params.set("category", categorySlug);
      if (selectedSource !== "all") params.set("source", selectedSource);
      fetcher.load(`/api/radar-items?${params.toString()}`);
    }
  }, [hasMore, page, fetcher, isLoading, selectedKind, categorySlug, selectedSource]);

  // fetcher レスポンス処理
  useEffect(() => {
    const data = fetcher.data;
    if (data?.radarItems) {
      if (isResetRef.current) {
        setItems(data.radarItems);
        isResetRef.current = false;
      } else {
        setItems((prev) => [...prev, ...data.radarItems]);
      }
      setHasMore(data.hasMore);
      setTotalCount(data.totalCount);
      setIsLoading(false);
    }
  }, [fetcher.data]);

  const { ref: observerRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView && hasMore && fetcher.state === "idle" && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, fetcher.state, loadMore, isLoading]);

  // period のみクライアントサイドフィルタ
  const filteredItems = items.filter((f) => {
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

  const selectedSourceData = selectedSource !== "all"
    ? loaderData.sources.find((s) => s.id === selectedSource)
    : undefined;

  return (
    <AppLayout
      title="Radar"
      selectedSource={selectedSource}
      setSelectedSource={handleSourceChange}
      selectedPeriod={selectedPeriod}
      setSelectedPeriod={setSelectedPeriod}
      selectedKind={selectedKind}
      setSelectedKind={setSelectedKind}
      showSourceFilter={true}
      sources={loaderData.sources}
      headerContent={
        selectedSourceData ? (
          <div className="flex items-center gap-2.5 mt-3">
            <Favicon domain={getDomainFromUrl(selectedSourceData.url)} size={20} />
            <span className="text-sm font-medium text-gray-900">{selectedSourceData.name}</span>
            <span className="text-xs text-gray-400">{totalCount} articles</span>
          </div>
        ) : (
          <CategoryFilter selectedCategorySlug={categorySlug} />
        )
      }
    >
      <CardGrid items={filteredItems} />
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          該当する記事がありません
        </div>
      )}

      {hasMore && filteredItems.length > 0 && (
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
