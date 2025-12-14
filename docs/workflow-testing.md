# Workflow Testing Guide

## プロジェクト構成

### ファイル構成

```
workers/
├── app.ts          # メインエントリーポイント (React Router + Scheduled)
├── workflow.ts     # Workflowロジック (MyWorkflow class)
└── scheduled.ts    # Scheduled専用エントリーポイント (テスト用)

wrangler.jsonc           # 本番・通常開発用設定
wrangler.scheduled.jsonc # Scheduled開発専用設定
```

### 設定の使い分け

- **`wrangler.jsonc`** - 本番デプロイと通常の開発で使用
  - `main: "./workers/app.ts"` - React Routerアプリ + Scheduledハンドラ

- **`wrangler.scheduled.jsonc`** - Scheduledトリガーのテスト専用
  - `main: "./workers/scheduled.ts"` - Scheduledハンドラのみ
  - React Routerの動的インポートを回避

## ローカルで Cron Trigger をテストする

### 方法1: Scheduled専用設定を使う（推奨）

`wrangler.scheduled.jsonc` を使用することで、React Routerの動的インポートエラーを回避できます。

#### 1. Scheduled専用サーバーを起動

```bash
# pnpmスクリプトを使用（推奨）
pnpm dev:scheduled

# または直接wranglerコマンドで
npx wrangler dev -c wrangler.scheduled.jsonc --test-scheduled
```

#### 2. Cron を手動でトリガー

別のターミナルで以下を実行:

```bash
# 毎時0分のCronをトリガー
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

これにより:
1. `scheduled()` ハンドラが呼ばれる
2. `env.MY_WORKFLOW.create()` でワークフローインスタンスが作成される
3. MyWorkflow の `run()` メソッドが実行される

### 方法2: 通常の設定を使う

```bash
# 通常の設定でScheduledテストも可能（React Routerも起動される）
npx wrangler dev --test-scheduled
```

**注意**: この方法では `import("virtual:react-router/server-build")` の動的インポートによりエラーが発生する可能性があります。その場合は方法1を使用してください。

### 3. ワークフローの実行を確認

コンソールに以下のようなログが表示されます:

```
Started workflow: <uuid> at <timestamp>
RSS fetch from multiple sources...
Filter new items...
Fetch OGP data...
LLM processing for category and summary...
Save to D1 database...
Workflow completed: X items saved
```

## 本番環境での Cron 設定

`wrangler.jsonc` で設定されている Cron スケジュール:

```jsonc
"triggers": {
  "crons": ["0 * * * *"]  // 毎時0分に実行
}
```

### Cron 式の例

- `0 * * * *` - 毎時0分
- `*/15 * * * *` - 15分ごと
- `0 0 * * *` - 毎日0時0分
- `0 */6 * * *` - 6時間ごと

## HTTP 経由でワークフローを手動トリガー (開発用)

開発時に手動でワークフローをトリガーしたい場合は、fetch ハンドラに追加のエンドポイントを実装できます:

```typescript
// workers/app.ts に追加
if (new URL(request.url).pathname === "/__workflow/trigger") {
  const instance = await env.MY_WORKFLOW.create({
    id: crypto.randomUUID(),
    params: { reason: "manual" },
  });
  return Response.json({
    id: instance.id,
    status: await instance.status()
  });
}
```

その後:

```bash
curl http://localhost:8787/__workflow/trigger
```

## デプロイ後の確認

```bash
# デプロイ
pnpm deploy

# Cron の状態を確認
npx wrangler deployments list

# ログを確認
npx wrangler tail
```
