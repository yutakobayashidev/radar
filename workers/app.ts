import { createRequestHandler } from "react-router";
import { WorkflowEntrypoint, type WorkflowStep, type WorkflowEvent } from 'cloudflare:workers';
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { parseFeed } from "htmlparser2";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";

declare global {
  interface CloudflareEnvironment extends Env { }
}

type FeedData = NonNullable<ReturnType<typeof parseFeed>>;

export class MyWorkflow extends WorkflowEntrypoint<Env> {
  override async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    const db = drizzle(this.env.DB, { schema });

    // Step 1: RSS fetch (複数ソース)
    const feedItems = await step.do("RSS fetch from multiple sources", async () => {
      const sources = await db.query.sources.findMany();
      const allItems: Array<{ sourceId: string; sourceName: string; domain: string; items: FeedData['items'] }> = [];

      for (const source of sources) {
        try {
          const response = await fetch(source.url);
          if (!response.ok) {
            console.error(`Failed to fetch ${source.url}: ${response.status}`);
            continue;
          }

          const htmlString = await response.text();
          const feed = parseFeed(htmlString);

          if (!feed || !feed.items) {
            console.error(`No feed items found for ${source.url}`);
            continue;
          }

          allItems.push({
            sourceId: source.id,
            sourceName: source.name,
            domain: source.domain,
            items: feed.items,
          });
        } catch (error) {
          console.error(`Error fetching ${source.url}:`, error);
        }
      }

      return allItems;
    });

    // Step 2: 新着判定 (D1で既読管理)
    const newItems = await step.do("Filter new items", async () => {
      const filtered: Array<{ sourceId: string; sourceName: string; domain: string; item: FeedData['items'][0] }> = [];

      for (const feedData of feedItems) {
        for (const item of feedData.items) {
          // URLで既存チェック
          const existing = await db.query.radarItems.findFirst({
            where: eq(schema.radarItems.url, item.link || ""),
          });

          if (!existing) {
            filtered.push({
              sourceId: feedData.sourceId,
              sourceName: feedData.sourceName,
              domain: feedData.domain,
              item,
            });
          }
        }
      }

      return filtered;
    });

    // Step 3: OGP取得 (失敗時はRSS descriptionにフォールバック)
    const itemsWithOGP = await step.do("Fetch OGP data", async () => {
      const results = [];

      for (const { sourceId, sourceName, domain, item } of newItems) {
        let image = "";
        let summary = item.description || "";

        try {
          const response = await fetch(item.link || "");
          if (response.ok) {
            const html = await response.text();
            const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
            if (ogImageMatch) {
              image = ogImageMatch[1];
            }
          }
        } catch (error) {
          console.error(`Failed to fetch OGP for ${item.link}:`, error);
        }

        // pubDate または updated を使用
        const timestamp = item.pubDate ? new Date(item.pubDate) : new Date();

        results.push({
          sourceId,
          sourceName,
          domain,
          title: item.title || "Untitled",
          url: item.link || "",
          timestamp,
          image,
          summary,
        });
      }

      return results;
    });

    // Step 4: LLM処理 (カテゴリ + サマリー生成)
    const processedItems = await step.do("LLM processing for category and summary", async () => {
      // TODO: AI bindings を使ってカテゴリとサマリーを生成
      // 現在は仮実装として、デフォルト値を設定
      return itemsWithOGP.map((item) => ({
        ...item,
        category: "Infrastructure", // TODO: LLMで判定
        summary: item.summary.substring(0, 200), // TODO: LLMで要約
      }));
    });

    // Step 5: D1保存
    await step.do("Save to D1 database", async () => {
      for (const item of processedItems) {
        await db.insert(schema.radarItems).values({
          title: item.title,
          source: item.sourceId,
          sourceName: item.sourceName,
          domain: item.domain,
          category: item.category,
          summary: item.summary,
          image: item.image,
          url: item.url,
          timestamp: item.timestamp,
        });
      }

      return { saved: processedItems.length };
    });

    return `Workflow completed: ${processedItems.length} items saved`;
  }
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    db: DrizzleD1Database<typeof schema>;
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const db = drizzle(env.DB, {
      schema,
    });
    return requestHandler(request, {
      cloudflare: { env, ctx },
      db,
    });
  },
} satisfies ExportedHandler<Env>;
