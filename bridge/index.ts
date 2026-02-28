import { createClient } from "xnotif";
import { appendFileSync } from "node:fs";
import { cookies, TWEETS_FILE } from "./config.js";
import { loadState, saveState } from "./state.js";
import { sendWithRetry } from "./webhook.js";

const client = createClient({
  cookies,
  state: loadState(),
});

client.on("notification", async (n) => {
  const record = { ...n, _receivedAt: new Date().toISOString() };
  console.log(JSON.stringify(record));
  appendFileSync(TWEETS_FILE, JSON.stringify(record) + "\n");
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
