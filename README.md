```bash
# マイグレーションファイルの作成
npx drizzle-kit generate

# ローカルに作成
npx wrangler d1 migrations apply <DATABASE_NAME> --local

# リモートに作成
npx wrangler d1 migrations apply <DATABASE_NAME> --remote
```
