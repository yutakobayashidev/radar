import type { Route } from "./+types/webhook-xnotif";
import { eq } from "drizzle-orm";
import * as schema from "../../../db/schema";
import { sendToDiscord, type TweetNotification } from "../../../workers/discord";

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

function extractTweetAuthor(uri: string): string {
  const match = uri.match(/^\/?@?([^/]+)\/status\//);
  return match ? match[1].toLowerCase() : "unknown";
}

function extractTweetId(tag: string): string {
  return tag.replace(/^tweet-/, "").replace(/^self_thread-/, "");
}

// n.title（通知元=フォロー中ユーザーの表示名）からsource IDを生成
function toSourceId(displayName: string): string {
  return `twitter-${displayName}`;
}

export async function action({ request, context }: Route.ActionArgs) {
  const { notifications } = (await request.json()) as {
    notifications: XnotifNotification[];
  };

  const db = context.db;
  const discordWebhookUrl = context.cloudflare.env.DISCORD_WEBHOOK_URL;
  const discordQueue: TweetNotification[] = [];
  let inserted = 0;
  let skipped = 0;

  for (const n of notifications) {
    if (n.data?.type !== "tweet" && n.data?.type !== "self_thread") continue;

    const tweetAuthor = extractTweetAuthor(n.data.uri);
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

    // sourceはフォロー中ユーザー（通知元）に紐づける
    const displayName = n.title;
    const sourceId = toSourceId(displayName);
    const source = await db.query.sources.findFirst({
      where: eq(schema.sources.id, sourceId),
    });

    if (!source) {
      await db.insert(schema.sources).values({
        id: sourceId,
        name: displayName,
        url: "https://x.com",
        description: `Tweets from ${displayName}`,
        category: "Twitter",
        categorySlug: "twitter",
        kind: "twitter",
      });
    }

    const tweetBody = n.data.body || n.body;
    const tweetTimestamp = new Date(Number(n.timestamp));

    await db.insert(schema.radarItems).values({
      title: displayName,
      source: sourceId,
      sourceName: displayName,
      summary: tweetBody,
      image: null,
      url: tweetUrl,
      type: "tweet",
      metadata: {
        icon: n.icon,
        handle: tweetAuthor,
        tweetId,
      },
      timestamp: tweetTimestamp,
    });
    inserted++;

    discordQueue.push({
      displayName,
      handle: tweetAuthor,
      body: tweetBody,
      url: tweetUrl,
      icon: n.icon,
      timestamp: tweetTimestamp,
    });
  }

  console.log(
    `Webhook: ${inserted} inserted, ${skipped} skipped, ${notifications.length} total`,
  );

  if (discordWebhookUrl && discordQueue.length > 0) {
    context.cloudflare.ctx.waitUntil(
      Promise.all(
        discordQueue.map((tweet) => sendToDiscord(discordWebhookUrl, tweet)),
      ),
    );
  }

  return Response.json({ ok: true, inserted, skipped });
}
