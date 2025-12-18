import { count, eq, desc } from "drizzle-orm";
import type { Route } from "./+types/radar-items";
import { radarItems as radarItemsTable, sources } from "../../../db/schema";

const ITEMS_PER_PAGE = 20;

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const [totalCountResult, radarItems] = await Promise.all([
    context.db.select({ count: count() }).from(radarItemsTable),
    context.db
      .select({
        id: radarItemsTable.id,
        title: radarItemsTable.title,
        source: radarItemsTable.source,
        sourceName: radarItemsTable.sourceName,
        summary: radarItemsTable.summary,
        image: radarItemsTable.image,
        url: radarItemsTable.url,
        timestamp: radarItemsTable.timestamp,
        createdAt: radarItemsTable.createdAt,
        updatedAt: radarItemsTable.updatedAt,
        category: sources.category,
      })
      .from(radarItemsTable)
      .innerJoin(sources, eq(radarItemsTable.source, sources.id))
      .orderBy(desc(radarItemsTable.timestamp))
      .limit(ITEMS_PER_PAGE)
      .offset(offset),
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
