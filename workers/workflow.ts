import { WorkflowEntrypoint, type WorkflowStep, type WorkflowEvent } from 'cloudflare:workers';
import { drizzle } from "drizzle-orm/d1";
import { parseFeed } from "htmlparser2";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";

type FeedData = NonNullable<ReturnType<typeof parseFeed>>;

export class MyWorkflow extends WorkflowEntrypoint<Env> {
  override async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    const db = drizzle(this.env.DB, { schema });
    console.log("🚀 Workflow started");

    // Step 1: RSS fetch + 新着判定 (統合して状態サイズを削減)
    const newItems = await step.do("Fetch RSS feeds and filter new items", {
      retries: {
        limit: 1,
        delay: "10 seconds",
      }
    }, async () => {
      console.log("📡 Step 1: Fetching RSS feeds from all sources...");
      const sources = await db.query.sources.findMany();
      console.log(`📋 Found ${sources.length} sources to fetch`);

      // 1か月前の日付を計算
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const filtered: Array<{
        sourceId: string;
        sourceName: string;
        title: string;
        url: string;
        description: string;
        pubDate: string | null;
      }> = [];
      let totalItems = 0;
      let skippedOldItems = 0;

      for (const source of sources) {
        try {
          console.log(`📥 Fetching: ${source.name} (${source.url})`);
          const response = await fetch(source.url);
          if (!response.ok) {
            console.error(`❌ Failed to fetch ${source.url}: ${response.status}`);
            continue;
          }

          const htmlString = await response.text();
          const feed = parseFeed(htmlString);

          if (!feed || !feed.items) {
            console.error(`⚠️  No feed items found for ${source.url}`);
            continue;
          }

          console.log(`✅ ${source.name}: ${feed.items.length} items`);
          let newCount = 0;

          for (const item of feed.items) {
            totalItems++;
            const url = item.link || "";

            // 日付チェック: 1か月以内のアイテムのみ
            if (item.pubDate) {
              const itemDate = new Date(item.pubDate);
              if (itemDate < oneMonthAgo) {
                skippedOldItems++;
                continue;
              }
            }

            // URLで既存チェック
            const existing = await db.query.radarItems.findFirst({
              where: eq(schema.radarItems.url, url),
            });

            if (!existing && url) {
              // 必要最小限のデータのみを保存（descriptionは短縮）
              filtered.push({
                sourceId: source.id,
                sourceName: source.name,
                title: item.title || "Untitled",
                url,
                description: (item.description || "").substring(0, 300), // 300文字に制限
                pubDate: item.pubDate ? String(item.pubDate) : null,
              });
              newCount++;
            }
          }

          if (newCount > 0) {
            console.log(`📌 ${source.name}: ${newCount} new items`);
          }
        } catch (error) {
          console.error(`❌ Error fetching ${source.url}:`, error);
        }
      }

      console.log(`✅ Step 1 complete: ${filtered.length} new items out of ${totalItems} total (skipped ${skippedOldItems} old items)`);
      return filtered;
    });

    // Step 2: OGP取得 (失敗時はRSS descriptionにフォールバック)
    const itemsWithOGP = await step.do("Fetch OGP data", async () => {
      console.log(`🖼️  Step 2: Fetching OGP data for ${newItems.length} items...`);
      const results = [];
      let ogpSuccessCount = 0;

      for (const item of newItems) {
        let image = "";
        let summary = item.description;

        try {
          const response = await fetch(item.url);
          if (response.ok) {
            const html = await response.text();
            const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
            if (ogImageMatch) {
              image = ogImageMatch[1];
              ogpSuccessCount++;
            }
          }
        } catch (error) {
          console.error(`⚠️  Failed to fetch OGP for ${item.url}:`, error);
        }

        // pubDate または updated を使用
        const timestamp = item.pubDate ? new Date(item.pubDate) : new Date();

        results.push({
          sourceId: item.sourceId,
          sourceName: item.sourceName,
          title: item.title,
          url: item.url,
          timestamp,
          image,
          summary,
        });
      }

      console.log(`✅ Step 2 complete: ${ogpSuccessCount}/${newItems.length} OGP images fetched`);
      return results;
    });

    // Step 3: LLM処理 (カテゴリ + サマリー生成)
    const processedItems = await step.do("LLM processing for category and summary", async () => {
      console.log(`🤖 Step 3: Processing ${itemsWithOGP.length} items with LLM...`);
      // TODO: AI bindings を使ってカテゴリとサマリーを生成
      // 現在は仮実装として、デフォルト値を設定
      const processed = itemsWithOGP.map((item) => ({
        ...item,
        category: "Infrastructure", // TODO: LLMで判定
        summary: item.summary.substring(0, 200), // TODO: LLMで要約
      }));
      console.log(`✅ Step 3 complete: ${processed.length} items processed`);
      return processed;
    });

    // Step 4: D1保存
    await step.do("Save to D1 database", async () => {
      console.log(`💾 Step 4: Saving ${processedItems.length} items to database...`);
      for (const item of processedItems) {
        await db.insert(schema.radarItems).values({
          title: item.title,
          source: item.sourceId,
          sourceName: item.sourceName,
          category: item.category,
          summary: item.summary,
          image: item.image,
          url: item.url,
          timestamp: item.timestamp,
        });
      }

      console.log(`✅ Step 4 complete: ${processedItems.length} items saved`);
      return { saved: processedItems.length };
    });

    return `Workflow completed: ${processedItems.length} items saved`;
  }
}
