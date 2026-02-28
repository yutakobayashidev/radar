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
npx drizzle-kit generate
npx wrangler d1 migrations apply radar --local
npx wrangler d1 migrations apply radar --remote
```

### Import sources

```bash
pnpm import-sources          # local
pnpm import-sources:remote   # remote
```

## Bridge (xnotif)

The `bridge/` directory contains a Node.js script that connects to Twitter via xnotif and forwards notifications to the webhook.

```bash
cd bridge
npm install
cp .env.example .env  # fill in credentials
npm start
```

Requires Node.js >= 22.

## Deploy

```bash
pnpm deploy
```
