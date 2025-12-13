export interface Source {
  id: string;
  name: string;
  domain: string;
  url: string;
  description: string;
  category: Category;
  articleCount: number;
  lastUpdated: string;
}

export interface FeedItem {
  id: number;
  title: string;
  source: string;
  sourceName: string;
  domain: string;
  category: Category;
  summary: string;
  image: string;
  url: string;
  timestamp: string;
}

export type Category = "AI" | "Infrastructure" | "Framework" | "Language" | "Runtime" | "Platform";

export const categories = ["All", "AI", "Infrastructure", "Framework", "Language", "Runtime", "Platform"] as const;

export const categoryColors: Record<Category, string> = {
  AI: "bg-purple-100 text-purple-700",
  Infrastructure: "bg-blue-100 text-blue-700",
  Framework: "bg-green-100 text-green-700",
  Language: "bg-orange-100 text-orange-700",
  Runtime: "bg-pink-100 text-pink-700",
  Platform: "bg-cyan-100 text-cyan-700",
};
