/**
 * Discord Webhook client for sending tweet notifications
 */

interface DiscordEmbed {
	author?: { name: string; icon_url?: string; url?: string };
	description?: string;
	url?: string;
	color?: number;
	timestamp?: string;
}

interface DiscordWebhookPayload {
	embeds: DiscordEmbed[];
}

export interface TweetNotification {
	displayName: string;
	handle: string;
	body: string;
	url: string;
	icon?: string;
	timestamp: Date;
}

export async function sendToDiscord(
	webhookUrl: string,
	tweet: TweetNotification,
): Promise<{ success: boolean; error?: string }> {
	const payload: DiscordWebhookPayload = {
		embeds: [
			{
				author: {
					name: `${tweet.displayName} (@${tweet.handle})`,
					icon_url: tweet.icon,
					url: `https://x.com/${tweet.handle}`,
				},
				description: `${tweet.body}\n\n${tweet.url}`,
				url: tweet.url,
				color: 0x1d9bf0, // X brand blue
				timestamp: tweet.timestamp.toISOString(),
			},
		],
	};

	try {
		const resp = await fetch(webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!resp.ok) {
			const errorText = await resp.text();
			console.error("Discord webhook error:", resp.status, errorText);
			return { success: false, error: `HTTP ${resp.status}: ${errorText}` };
		}

		return { success: true };
	} catch (error) {
		console.error("Failed to send to Discord:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
