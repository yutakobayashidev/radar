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

export interface RadarItem {
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
  AI: "bg-gray-100 text-gray-600",
  Infrastructure: "bg-gray-100 text-gray-600",
  Framework: "bg-gray-100 text-gray-600",
  Language: "bg-gray-100 text-gray-600",
  Runtime: "bg-gray-100 text-gray-600",
  Platform: "bg-gray-100 text-gray-600",
};
