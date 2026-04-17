import { WorkflowEntrypoint, type WorkflowStep, type WorkflowEvent } from 'cloudflare:workers';
import { drizzle } from "drizzle-orm/d1";
import { parseFeed } from "htmlparser2";
import { eq, ne } from "drizzle-orm";
import * as schema from "../db/schema";
import { postToMastodon, formatFeedItemForMastodon } from "./mastodon";

type ParsedLikeItem = {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
};

async function parseDistanceMediaItems(): Promise<ParsedLikeItem[]> {
  const res = await fetch("https://distance.media/dist/js/distanceposts.json", {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return [];

  const json = await res.json() as {
    data?: Array<{
      type?: number;
      article_id?: string;
      title?: string;
      subtitle?: string;
      article_date?: string;
      update_date?: string;
      article_theme?: string;
      article_category?: string;
    }>;
  };

  const rows = Array.isArray(json.data) ? json.data : [];
  return rows
    .filter((x) => x.type === 0 && x.article_id && x.title)
    .map((x) => ({
      title: x.subtitle ? `${x.title}｜${x.subtitle}` : x.title || "Untitled",
      link: `https://distance.media/article/${x.article_id}/`,
      description: [x.article_theme, x.article_category].filter(Boolean).join(" / "),
      pubDate: x.update_date || x.article_date,
    }));
}

async function parseItemsBySource(source: { id: string; url: string }, text: string): Promise<ParsedLikeItem[]> {
  const feed = parseFeed(text);
  if (feed?.items?.length) {
    return feed.items.map((item) => ({
      title: item.title || "Untitled",
      link: item.link || "",
      description: item.description || "",
      pubDate: item.pubDate,
    }));
  }

  if (source.url.includes("distance.media") || source.id === "distance-media") {
    return parseDistanceMediaItems();
  }

  return [];
}

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
      const sources = await db.query.sources.findMany({
        where: ne(schema.sources.kind, "twitter"),
      });
      console.log(`📋 Found ${sources.length} sources to fetch`);

      // 3日前の日付を計算
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const filtered: Array<{
        sourceId: string;
        sourceName: string;
        title: string;
        url: string;
        description: string;
        pubDate: number | null; // Unix ms — number は直列化で安全
      }> = [];
      let totalItems = 0;
      let skippedOldItems = 0;

      for (const source of sources) {
        try {
          console.log(`📥 Fetching: ${source.name} (${source.url})`);
          // vitalik.ca を vitalik.eth.limo に置換
          const fetchUrl = source.url.replace(/vitalik\.ca/g, 'vitalik.eth.limo');
          const response = await fetch(fetchUrl, { signal: AbortSignal.timeout(10_000) });
          if (!response.ok) {
            console.error(`❌ Failed to fetch ${source.url}: ${response.status}`);
            continue;
          }

          const bodyText = await response.text();
          const parsedItems = await parseItemsBySource(source, bodyText);

          if (!parsedItems.length) {
            console.error(`⚠️  No items found for ${source.url}`);
            continue;
          }

          console.log(`✅ ${source.name}: ${parsedItems.length} items`);
          let newCount = 0;

          for (const item of parsedItems) {
            totalItems++;
            const url = item.link || "";

            // pubDateのバリデーション (Invalid Date対策)
            const pubDateObj = item.pubDate ? new Date(item.pubDate) : null;
            const pubDateMs = pubDateObj && !isNaN(pubDateObj.getTime()) ? pubDateObj.getTime() : null;

            // 日付チェック: 3日以内のアイテムのみ
            if (pubDateMs) {
              if (pubDateMs < threeDaysAgo.getTime()) {
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
              // pubDateはUnix ms (number) で保存 — Workflow step間の直列化で安全
              filtered.push({
                sourceId: source.id,
                sourceName: source.name,
                title: item.title || "Untitled",
                url,
                description: (item.description || "").substring(0, 300), // 300文字に制限
                pubDate: pubDateMs,
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
          const response = await fetch(item.url, { signal: AbortSignal.timeout(10_000) });
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

        // pubDateはUnix ms (number) — nullなら現在時刻、未来日付は現在時刻にキャップ
        const now = Date.now();
        const timestamp = Math.min(item.pubDate ?? now, now);

        results.push({
          sourceId: item.sourceId,
          sourceName: item.sourceName,
          title: item.title,
          url: item.url,
          timestamp, // number (Unix ms) — Workflow step間の直列化で安全
          image,
          summary,
        });
      }

      console.log(`✅ Step 2 complete: ${ogpSuccessCount}/${newItems.length} OGP images fetched`);
      return results;
    });

    // Step 3: LLM処理 (サマリー生成)
    const processedItems = await step.do("LLM processing for summary", async () => {
      console.log(`🤖 Step 3: Processing ${itemsWithOGP.length} items with LLM...`);
      // TODO: AI bindings を使ってサマリーを生成
      // 現在は仮実装として、デフォルト値を設定
      const processed = itemsWithOGP.map((item) => ({
        ...item,
        summary: item.summary.substring(0, 200), // TODO: LLMで要約
      }));
      console.log(`✅ Step 3 complete: ${processed.length} items processed`);
      return processed;
    });

    // Step 4: D1保存
    await step.do("Save to D1 database", async () => {
      console.log(`💾 Step 4: Saving ${processedItems.length} items to database...`);
      let savedCount = 0;
      let skippedCount = 0;

      for (const item of processedItems) {
        try {
          await db.insert(schema.radarItems).values({
            title: item.title,
            source: item.sourceId,
            sourceName: item.sourceName,
            summary: item.summary,
            image: item.image,
            url: item.url,
            type: "article",
            timestamp: new Date(item.timestamp), // number → Date に変換
          }).onConflictDoNothing();
          savedCount++;
        } catch (error) {
          // 個別のINSERT失敗でステップ全体を止めない
          console.error(`⚠️ Failed to insert ${item.url}:`, error);
          skippedCount++;
        }
      }

      console.log(`✅ Step 4 complete: ${savedCount} saved, ${skippedCount} skipped`);
      return { saved: savedCount, skipped: skippedCount };
    });

    // Step 5: Mastodon投稿
    await step.do("Post new items to Mastodon", async () => {
      console.log(`🐘 Step 5: Posting ${processedItems.length} items to Mastodon...`);

      // 古いものから先に投稿するため、timestampで昇順ソート
      // timestamp は number (Unix ms) なので直接比較可能
      const sortedItems = [...processedItems].sort((a, b) =>
        a.timestamp - b.timestamp
      );

      let successCount = 0;
      let failureCount = 0;

      for (const item of sortedItems) {
        try {
          // Format the post
          const status = formatFeedItemForMastodon(item.title, item.url);

          // Post to Mastodon
          const result = await postToMastodon(this.env, {
            status,
            visibility: 'public',
          });

          if (result.success) {
            console.log(`✅ Posted to Mastodon: ${item.title} (ID: ${result.id})`);
            successCount++;
          } else {
            console.error(`❌ Failed to post: ${item.title} - ${result.error}`);
            failureCount++;
          }
        } catch (error) {
          console.error(`❌ Error posting to Mastodon:`, error);
          failureCount++;
        }
      }

      console.log(`✅ Step 5 complete: ${successCount} posted, ${failureCount} failed`);
      return { posted: successCount, failed: failureCount };
    });

    return `Workflow completed: ${processedItems.length} items saved and posted to Mastodon`;
  }
}
