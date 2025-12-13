import type { Route } from "./+types/home";
import { Header } from "../components/ui";
import { FeedList } from "../components/feed";
import { mockFeedItems } from "../data/mock";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Feed - Feed App" },
    { name: "description", content: "Your personalized feed reader" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Feed
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Latest updates from your sources
          </p>
        </div>
        <FeedList items={mockFeedItems} />
      </main>
    </div>
  );
}
