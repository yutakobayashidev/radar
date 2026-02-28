import type { Route } from "./+types/webhook-xnotif";
import { eq } from "drizzle-orm";
import * as schema from "../../../db/schema";

interface XnotifNotification {
  title: string;
  body: string;
  icon: string;
  timestamp: string;
  tag: string;
  data: {
    type: string;
    uri: string;
    title: string;
    body: string;
  };
}

function extractHandle(uri: string): string {
  const match = uri.match(/^\/?@?([^/]+)\/status\//);
  return match ? match[1].toLowerCase() : "unknown";
}

function extractTweetId(tag: string): string {
  return tag.replace(/^tweet-/, "").replace(/^self_thread-/, "");
}

export async function action({ request, context }: Route.ActionArgs) {
  const { notifications } = (await request.json()) as {
    notifications: XnotifNotification[];
  };

  const db = context.db;
  let inserted = 0;
  let skipped = 0;

  for (const n of notifications) {
    if (n.data?.type !== "tweet" && n.data?.type !== "self_thread") continue;

    const handle = extractHandle(n.data.uri);
    const tweetId = extractTweetId(n.tag);
    const tweetUrl = `https://x.com${n.data.uri.startsWith("/") ? "" : "/"}${n.data.uri}`;

    // URL重複チェック
    const existing = await db.query.radarItems.findFirst({
      where: eq(schema.radarItems.url, tweetUrl),
    });
    if (existing) {
      skipped++;
      continue;
    }

    // 動的source作成
    const sourceId = `twitter-${handle}`;
    const source = await db.query.sources.findFirst({
      where: eq(schema.sources.id, sourceId),
    });

    if (!source) {
      await db.insert(schema.sources).values({
        id: sourceId,
        name: `@${handle}`,
        url: `https://x.com/${handle}`,
        description: `Tweets from @${handle}`,
        category: "Twitter",
        categorySlug: "twitter",
        kind: "twitter",
      });
    }

    await db.insert(schema.radarItems).values({
      title: `@${handle}`,
      source: sourceId,
      sourceName: `@${handle}`,
      summary: n.data.body || n.body,
      image: null,
      url: tweetUrl,
      type: "tweet",
      metadata: {
        icon: n.icon,
        handle,
        tweetId,
      },
      timestamp: new Date(Number(n.timestamp)),
    });
    inserted++;
  }

  console.log(
    `Webhook: ${inserted} inserted, ${skipped} skipped, ${notifications.length} total`,
  );
  return Response.json({ ok: true, inserted, skipped });
}
