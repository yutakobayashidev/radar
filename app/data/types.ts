export interface Source {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RadarItem {
  id: number;
  title: string;
  source: string;
  sourceName: string;
  summary: string;
  image: string | null;
  url: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const categories = [
  "All",
  "AI/ML",
  "Developer Tools",
  "Web Standards",
  "Security & Privacy",
  "Digital Identity",
  "Platform & Services",
  "Company Engineering",
  "Personal Blog",
  "Social Impact",
  "Media & Culture"
] as const;

export type Category = typeof categories[number];

export const periods = ["All", "Month", "Today"] as const;
export type Period = typeof periods[number];

export interface RadarItemWithCategory extends RadarItem {
  category: string;
}

export const categoryColors: Record<string, string> = {
  "AI/ML": "bg-purple-100 text-purple-700",
  "Developer Tools": "bg-blue-100 text-blue-700",
  "Web Standards": "bg-green-100 text-green-700",
  "Security & Privacy": "bg-red-100 text-red-700",
  "Digital Identity": "bg-indigo-100 text-indigo-700",
  "Platform & Services": "bg-cyan-100 text-cyan-700",
  "Company Engineering": "bg-orange-100 text-orange-700",
  "Personal Blog": "bg-pink-100 text-pink-700",
  "Social Impact": "bg-yellow-100 text-yellow-700",
  "Media & Culture": "bg-teal-100 text-teal-700",
};

export interface FetchRadarItemsResponse {
  radarItems: RadarItemWithCategory[];
  hasMore: boolean;
  currentPage: number;
  totalCount: number;
}

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
