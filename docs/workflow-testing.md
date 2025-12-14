# Workflow Testing Guide

## ローカルで Cron Trigger をテストする

### 1. Cron トリガー付きで開発サーバーを起動

```bash
npx wrangler dev --test-scheduled
```

### 2. Cron を手動でトリガー

別のターミナルで以下を実行:

```bash
# 毎時0分のCronをトリガー
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

これにより:
1. `scheduled()` ハンドラが呼ばれる
2. `env.MY_WORKFLOW.create()` でワークフローインスタンスが作成される
3. MyWorkflow の `run()` メソッドが実行される

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
