# TweetDeck風マルチカラムUI実装

## 概要
`category=all` かつ `source=all` の時、カテゴリごとのカラムで分けたTweetDeck風UIに置き換える。
全アイテムをツイート風UIに統一：本文（ツイート→テキスト、記事→タイトル）+ リンクカード（記事のみ、OG画像+ドメイン）。

## deck mode条件
- `category=all` AND `source=all` → deck mode ON
- 特定カテゴリ選択 or 特定ソース選択 → deck mode OFF（既存UI）
- `kind` フィルター → deck mode内の各カラムに適用（例: kind=twitter → 各カラムのツイートのみ表示）
- `period` フィルター → deck mode内でクライアントサイドフィルタ（既存と同じ）

## 実装ステップ

### Step 1: 型定義追加 (`app/data/types.ts`)
- [ ] `DeckColumnData`: `{ items: RadarItemWithCategory[], hasMore: boolean }`
- [ ] `DeckData`: `Record<string, DeckColumnData>`

### Step 2: homeローダーをdeck mode対応 (`app/routes/home.tsx`)
- [ ] category=all かつ source=all 時、カテゴリ別に並列クエリ（各10件）
- [ ] kindフィルターがある場合は各カテゴリクエリにも適用
- [ ] deck用データ構造を返す

### Step 3: DeckView コンポーネント作成 (`app/components/feed/DeckView.tsx`)
- [ ] `FeedCard`: 全アイテム統一のツイート風カード
  - アイコン（tweet→アバター、article→favicon）+ ソース名 + 時間
  - 本文（tweet→ツイートテキスト with LinkifiedText、article→記事タイトル）
  - リンクカード（articleのみ: OG画像サムネ+ドメイン表示。ツイートはテキスト内URLリンクで十分）
- [ ] `DeckColumn`: カテゴリヘッダー(色付き) + 独立スクロールのアイテムリスト + load more
- [ ] `DeckView`: 横スクロールコンテナ（アイテムがあるカラムのみ表示）

### Step 4: home.tsx 統合
- [ ] deck mode判定: category=all AND source=all
- [ ] deck mode → DeckView（カテゴリフィルター非表示）
- [ ] 非deck mode → 既存のCardGrid/TweetTimeline

### Step 5: AppLayout調整
- [ ] deck mode時、mainのoverflow/padding調整（横スクロール可能に）
