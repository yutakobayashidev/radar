import { count } from "drizzle-orm";
import type { Route } from "./+types/radar-items";
import { radarItems as radarItemsTable } from "../../../db/schema";

const ITEMS_PER_PAGE = 20;

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const [totalCountResult, radarItems] = await Promise.all([
    context.db.select({ count: count() }).from(radarItemsTable),
    context.db.query.radarItems.findMany({
      orderBy: (radarItems, { desc }) => [desc(radarItems.timestamp)],
      limit: ITEMS_PER_PAGE,
      offset,
    }),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;
  const hasMore = offset + radarItems.length < totalCount;

  return {
    radarItems,
    hasMore,
    currentPage: page,
    totalCount,
  };
}
