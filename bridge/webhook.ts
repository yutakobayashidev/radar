import type { TwitterNotification } from "xnotif";
import { WEBHOOK_URL, webhookHeaders } from "./config.js";

export async function sendWithRetry(
  notification: TwitterNotification,
  maxRetries = 3,
): Promise<void> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: webhookHeaders,
        body: JSON.stringify({ notifications: [notification] }),
      });
      if (res.ok) {
        console.log(`Webhook sent: ${notification.title} - ${notification.body?.substring(0, 50)}`);
        return;
      }
      console.error(
        `Webhook failed (${res.status}), retry ${i + 1}/${maxRetries}`,
      );
    } catch (e) {
      console.error(`Webhook error, retry ${i + 1}/${maxRetries}:`, e);
    }
    if (i < maxRetries)
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
  }
  console.error("Webhook delivery failed after retries");
}
