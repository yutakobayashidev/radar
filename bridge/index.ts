import { createClient, type ClientState } from "xnotif";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dirname, ".xnotif-state.json");

const WEBHOOK_URL = "https://radar.yutakobayashi.com/api/webhook-xnotif";
const CF_ACCESS_CLIENT_ID = process.env.CF_ACCESS_CLIENT_ID!;
const CF_ACCESS_CLIENT_SECRET = process.env.CF_ACCESS_CLIENT_SECRET!;
const COOKIES_RAW = process.env.COOKIES!;

if (!COOKIES_RAW || !CF_ACCESS_CLIENT_ID || !CF_ACCESS_CLIENT_SECRET) {
  console.error(
    "Missing required env vars: COOKIES, CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET",
  );
  process.exit(1);
}

function parseCookies(raw: string): Record<string, string> {
  return Object.fromEntries(
    raw.split(";").map((pair) => {
      const [key, ...rest] = pair.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
  );
}

const cookies = parseCookies(COOKIES_RAW) as { auth_token: string; ct0: string; [key: string]: string };
if (!cookies.auth_token || !cookies.ct0) {
  console.error("COOKIES must contain auth_token and ct0");
  process.exit(1);
}

function loadState(): ClientState | undefined {
  if (existsSync(STATE_FILE)) {
    try {
      return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function saveState(state: ClientState) {
  writeFileSync(STATE_FILE, JSON.stringify(state));
}

async function sendWithRetry(
  notification: unknown,
  maxRetries = 3,
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "CF-Access-Client-Id": CF_ACCESS_CLIENT_ID,
    "CF-Access-Client-Secret": CF_ACCESS_CLIENT_SECRET,
  };

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ notifications: [notification] }),
      });
      if (res.ok) return;
      console.error(
        `Webhook failed (${res.status}), retry ${i + 1}/${maxRetries}`,
      );
    } catch (e) {
      console.error(`Webhook error, retry ${i + 1}/${maxRetries}:`, e);
    }
    if (i < maxRetries) await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
  }
  console.error("Webhook delivery failed after retries");
}

const client = createClient({
  cookies,
  state: loadState(),
});

client.on("notification", async (n) => {
  console.log(`[notification] ${n.title}: ${n.body?.substring(0, 80)}`);
  await sendWithRetry(n);
});

client.on("connected", (state) => {
  console.log("[connected] Saving state...");
  saveState(state);
});

client.on("error", (e) => {
  console.error("[error]", e);
});

client.on("disconnected", () => {
  console.log("[disconnected]");
});

client.on("reconnecting", (delay) => {
  console.log(`[reconnecting] in ${delay}ms...`);
});

console.log("Starting xnotif bridge...");
await client.start();
console.log("xnotif bridge connected.");
