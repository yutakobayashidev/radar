export interface Source {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  articleCount: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RadarItem {
  id: number;
  title: string;
  source: string;
  sourceName: string;
  category: string;
  summary: string;
  image: string;
  url: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const categories = ["All", "AI", "Infrastructure", "Framework", "Language", "Runtime", "Platform"] as const;

export const categoryColors: Record<string, string> = {
  AI: "bg-gray-100 text-gray-600",
  Infrastructure: "bg-gray-100 text-gray-600",
  Framework: "bg-gray-100 text-gray-600",
  Language: "bg-gray-100 text-gray-600",
  Runtime: "bg-gray-100 text-gray-600",
  Platform: "bg-gray-100 text-gray-600",
};

// URLからドメインを抽出するユーティリティ関数
export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return "";
  }
}
