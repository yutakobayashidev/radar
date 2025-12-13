import { Link } from "react-router";
import type { Route } from "./+types/about";
import { AppLayout } from "~/components/layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - Feed" },
    { name: "description", content: "このサイトについて" },
  ];
}

export default function About() {
  return (
    <AppLayout title="About">
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Feedに戻る
        </Link>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">このサイトについて</h2>

          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              Feedは、テック系ブログやニュースサイトの更新情報をまとめてチェックできるフィードリーダーです。
            </p>

            <p>
              お気に入りの技術ブログを一箇所で確認でき、カテゴリやソースで絞り込むことができます。
            </p>

            <h3 className="text-base font-medium text-gray-900 pt-2">機能</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>複数のテックブログの更新を一覧表示</li>
              <li>カテゴリ別フィルタリング</li>
              <li>ソース別フィルタリング</li>
            </ul>

            <h3 className="text-base font-medium text-gray-900 pt-2">技術スタック</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>React Router v7</li>
              <li>Tailwind CSS</li>
              <li>TypeScript</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
