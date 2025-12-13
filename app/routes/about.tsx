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
              私が日常的にチェックしているテック系ブログやニュースサイトの更新情報をまとめたフィードです。
            </p>

            <p>
              AI、インフラ、プログラミング言語、フレームワークなど、個人的に興味のある分野の情報を購読・キュレーションしています。
            </p>

            <p>
              同じような興味を持つ方の情報収集の参考になれば幸いです。
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
