# Feed App

Tech Radar風のRSSフィードアグリゲーター

## 開発環境

### 通常の開発（React Routerアプリ）

```bash
pnpm dev
# または
npx wrangler dev
```

### Scheduledトリガーのテスト

Cronトリガーをローカルでテストする場合は、専用の設定ファイルを使用します：

```bash
# ターミナル1: Scheduled専用設定で起動
pnpm dev:scheduled
# または
npx wrangler dev -c wrangler.scheduled.jsonc --test-scheduled

# ターミナル2: Cronを手動トリガー
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

詳細は [Workflow Testing Guide](./docs/workflow-testing.md) を参照してください。

## データベース

### マイグレーション

```bash
# マイグレーションファイルの作成
npx drizzle-kit generate

# ローカルに適用
npx wrangler d1 migrations apply radar --local

# リモートに適用
npx wrangler d1 migrations apply radar --remote
```

### ソースデータのインポート

```bash
# ローカルDBにインポート
pnpm import-sources:local

# リモートDBにインポート
pnpm import-sources:remote
```

## デプロイ

```bash
pnpm deploy
```
