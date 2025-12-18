import type { Route } from "./+types/radar-items";

const ITEMS_PER_PAGE = 20;

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const offset = (page - 1) * ITEMS_PER_PAGE;

  // 総数を取得
  const totalCount = await context.db.query.radarItems.findMany();

  // ページネーションでデータを取得
  const radarItems = await context.db.query.radarItems.findMany({
    orderBy: (radarItems, { desc }) => [desc(radarItems.timestamp)],
    limit: ITEMS_PER_PAGE,
    offset,
  });

  const hasMore = offset + radarItems.length < totalCount.length;

  return {
    radarItems,
    hasMore,
    currentPage: page,
    totalCount: totalCount.length,
  };
}
