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

// 日付を相対時間でフォーマットするユーティリティ関数
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) {
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  } else if (diffDays > 0) {
    return `${diffDays}日前`;
  } else if (diffHours > 0) {
    return `${diffHours}時間前`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分前`;
  } else {
    return 'たった今';
  }
}
