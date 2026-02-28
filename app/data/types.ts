export interface Source {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  categorySlug: string;
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

export const categoryList = [
  { name: "All", slug: "all", color: "bg-gray-100 text-gray-700" },
  { name: "AI/ML", slug: "ai-ml", color: "bg-purple-100 text-purple-700" },
  { name: "Developer Tools", slug: "developer-tools", color: "bg-blue-100 text-blue-700" },
  { name: "Web Standards", slug: "web-standards", color: "bg-green-100 text-green-700" },
  { name: "Security & Privacy", slug: "security-privacy", color: "bg-red-100 text-red-700" },
  { name: "Digital Identity", slug: "digital-identity", color: "bg-indigo-100 text-indigo-700" },
  { name: "Platform & Services", slug: "platform-services", color: "bg-cyan-100 text-cyan-700" },
  { name: "Company Engineering", slug: "company-engineering", color: "bg-orange-100 text-orange-700" },
  { name: "Personal Blog", slug: "personal-blog", color: "bg-pink-100 text-pink-700" },
  { name: "Social Impact", slug: "social-impact", color: "bg-yellow-100 text-yellow-700" },
  { name: "Media & Culture", slug: "media-culture", color: "bg-teal-100 text-teal-700" },
] as const;

export type CategoryInfo = typeof categoryList[number];
export type CategoryName = CategoryInfo["name"];
export type CategorySlug = CategoryInfo["slug"];

export function getCategoryBySlug(slug: string): CategoryInfo {
  return categoryList.find(c => c.slug === slug) || categoryList[0];
}

export function getCategoryByName(name: string): CategoryInfo {
  return categoryList.find(c => c.name === name) || categoryList[0];
}

export const periods = ["All", "Month", "Today"] as const;
export type Period = typeof periods[number];

export interface RadarItemWithCategory extends RadarItem {
  category: string;
  categorySlug: string;
  kind: string;
}

export const kindList = [
  { name: "All", slug: "all" },
  { name: "Articles", slug: "articles" },
  { name: "Releases", slug: "releases" },
  { name: "Video", slug: "video" },
  { name: "Podcast", slug: "podcast" },
  { name: "Twitter", slug: "twitter" },
] as const;

export type Kind = typeof kindList[number]["slug"];

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
