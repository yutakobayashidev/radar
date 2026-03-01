// Augment the auto-generated Env interface with additional secrets
declare namespace Cloudflare {
	interface Env {
		MASTODON_ACCESS_TOKEN: string;
		DISCORD_WEBHOOK_URL: string;
	}
}
