# Radar

RSS feed aggregator with Twitter integration, built on Cloudflare Workers.

**Live**: [radar.yutakobayashi.com](https://radar.yutakobayashi.com)

## Stack

- **Runtime**: Cloudflare Workers
- **Framework**: React Router 7
- **Database**: Cloudflare D1 (SQLite) + Drizzle ORM
- **Styling**: Tailwind CSS 4
- **Twitter**: [xnotif](https://github.com/yutakobayashidev/xnotif) via Pi bridge

## Architecture

```
RSS Feeds ──► Cron Workflow ──► D1 ──► React Router App
                                 ▲
xnotif (Pi) ──► Webhook ─────────┘
```

- **Hourly cron** fetches RSS feeds, extracts OGP data, saves to D1, and posts to Mastodon
- **xnotif bridge** runs on Raspberry Pi, forwards Twitter push notifications to a webhook endpoint
- **Cloudflare Access** protects the webhook with Service Token auth

## Development

```bash
pnpm dev
```

### Testing scheduled triggers

```bash
# Terminal 1
pnpm dev:scheduled

# Terminal 2
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

## Database

### Migrations

```bash
pnpm drizzle-kit generate
pnpm wrangler d1 migrations apply radar --local
pnpm wrangler d1 migrations apply radar --remote
```

### Import sources

```bash
pnpm import-sources          # local
pnpm import-sources:remote   # remote
```

## Bridge (xnotif)

The `bridge/` directory contains a Node.js script that connects to Twitter via xnotif and forwards notifications to the webhook.

Requires Node.js >= 22.

### 1. Create a Cloudflare Access Service Token

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Access → Service Auth → Service Tokens**
3. Click **Create Service Token** and give it a name (e.g. `radar-bridge`)
4. Copy the **Client ID** and **Client Secret** — the secret is only shown once

### 2. Protect the webhook endpoint

1. In the Zero Trust Dashboard, go to **Access → Applications → Add an application**
2. Select **Self-hosted**
3. Set **Application domain** to `radar.yutakobayashi.com` and **Path** to `api/webhook-xnotif`
4. Add a policy with **Action**: Service Auth, **Include**: the service token created above

### 3. Run the bridge

```bash
cd bridge
pnpm install
cp .env.example .env
```

Fill in `.env` with the service token credentials:

```
CF_ACCESS_CLIENT_ID=<your-client-id>.access
CF_ACCESS_CLIENT_SECRET=<your-client-secret>
```

Create `config.json` with your Twitter cookies and xnotif client state:

```json
{
  "cookies": { "auth_token": "...", "ct0": "..." },
  "state": {}
}
```

Start the bridge:

```bash
pnpm start
```

## Deploy

```bash
pnpm deploy
```
