import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const STATE_FILE = join(__dirname, ".xnotif-state.json");
export const TWEETS_FILE = join(__dirname, "tweets.jsonl");
export const WEBHOOK_URL = "https://radar.yutakobayashi.com/api/webhook-xnotif";

function parseCookies(raw: string): Record<string, string> {
  return Object.fromEntries(
    raw.split(";").map((pair) => {
      const [key, ...rest] = pair.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
  );
}

const COOKIES_RAW = process.env.COOKIES!;
const CF_ACCESS_CLIENT_ID = process.env.CF_ACCESS_CLIENT_ID!;
const CF_ACCESS_CLIENT_SECRET = process.env.CF_ACCESS_CLIENT_SECRET!;

if (!COOKIES_RAW || !CF_ACCESS_CLIENT_ID || !CF_ACCESS_CLIENT_SECRET) {
  console.error(
    "Missing required env vars: COOKIES, CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET",
  );
  process.exit(1);
}

export const cookies = parseCookies(COOKIES_RAW) as {
  auth_token: string;
  ct0: string;
  [key: string]: string;
};

if (!cookies.auth_token || !cookies.ct0) {
  console.error("COOKIES must contain auth_token and ct0");
  process.exit(1);
}

export const webhookHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  "CF-Access-Client-Id": CF_ACCESS_CLIENT_ID,
  "CF-Access-Client-Secret": CF_ACCESS_CLIENT_SECRET,
};
