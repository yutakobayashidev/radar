import { count, eq, desc, and, type SQL } from "drizzle-orm";
import type { Route } from "./+types/radar-items";
import { radarItems as radarItemsTable, sources } from "../../../db/schema";

const ITEMS_PER_PAGE = 20;

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const kindParam = url.searchParams.get("kind");
  const categoryParam = url.searchParams.get("category");
  const sourceParam = url.searchParams.get("source");

  const conditions: SQL[] = [];
  if (kindParam && kindParam !== "all") {
    conditions.push(eq(sources.kind, kindParam));
  }
  if (categoryParam && categoryParam !== "all") {
    conditions.push(eq(sources.categorySlug, categoryParam));
  }
  if (sourceParam && sourceParam !== "all") {
    conditions.push(eq(radarItemsTable.source, sourceParam));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalCountResult, radarItems] = await Promise.all([
    context.db
      .select({ count: count() })
      .from(radarItemsTable)
      .innerJoin(sources, eq(radarItemsTable.source, sources.id))
      .where(whereClause),
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
        categorySlug: sources.categorySlug,
        kind: sources.kind,
      })
      .from(radarItemsTable)
      .innerJoin(sources, eq(radarItemsTable.source, sources.id))
      .where(whereClause)
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
