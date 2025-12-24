/**
 * Mastodon API client for posting statuses
 * Based on: https://www.raymondcamden.com/2023/08/14/building-a-mastodon-bot-with-cloudflare-workers
 */

export interface MastodonPostOptions {
	status: string;
	visibility?: 'public' | 'unlisted' | 'private' | 'direct';
}

/**
 * Post a status to Mastodon
 */
export async function postToMastodon(
	env: { MASTODON_INSTANCE: string; MASTODON_ACCESS_TOKEN: string },
	options: MastodonPostOptions
): Promise<{ success: boolean; error?: string; id?: string }> {
	try {
		const data = new FormData();
		data.append('status', options.status);
		data.append('visibility', options.visibility || 'public');

		const resp = await fetch(`${env.MASTODON_INSTANCE}/api/v1/statuses`, {
			method: 'POST',
			body: data,
			headers: {
				Authorization: `Bearer ${env.MASTODON_ACCESS_TOKEN}`,
			},
		});

		if (!resp.ok) {
			const errorText = await resp.text();
			console.error('Mastodon API error:', resp.status, errorText);
			return {
				success: false,
				error: `HTTP ${resp.status}: ${errorText}`,
			};
		}

		const result = (await resp.json()) as { id: string };
		return {
			success: true,
			id: result.id,
		};
	} catch (error) {
		console.error('Failed to post to Mastodon:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * Format a feed item for Mastodon posting
 */
export function formatFeedItemForMastodon(title: string, url: string): string {
	// Simple format: just title and URL
	return `${title}\n${url}`;
}
