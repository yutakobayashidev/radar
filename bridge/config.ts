import type { ClientState } from "xnotif";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const CONFIG_FILE = join(__dirname, "config.json");
export const TWEETS_FILE = join(__dirname, "tweets.jsonl");
export const WEBHOOK_URL = "https://radar.yutakobayashi.com/api/webhook-xnotif";

export interface StoredConfig {
  state: ClientState;
  cookies: { auth_token: string; ct0: string; [key: string]: string };
}

export function loadConfig(): StoredConfig {
  if (!existsSync(CONFIG_FILE)) {
    console.error("config.json not found. Create it with cookies and state.");
    process.exit(1);
  }
  const config: StoredConfig = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  if (!config.cookies?.auth_token || !config.cookies?.ct0) {
    console.error("config.json must contain cookies with auth_token and ct0");
    process.exit(1);
  }
  return config;
}

export function saveConfig(config: StoredConfig): void {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

const CF_ACCESS_CLIENT_ID = process.env.CF_ACCESS_CLIENT_ID!;
const CF_ACCESS_CLIENT_SECRET = process.env.CF_ACCESS_CLIENT_SECRET!;

if (!CF_ACCESS_CLIENT_ID || !CF_ACCESS_CLIENT_SECRET) {
  console.error(
    "Missing required env vars: CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET",
  );
  process.exit(1);
}

export const webhookHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  "CF-Access-Client-Id": CF_ACCESS_CLIENT_ID,
  "CF-Access-Client-Secret": CF_ACCESS_CLIENT_SECRET,
};
