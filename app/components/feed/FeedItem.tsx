import { Card } from "../ui/Card";

export interface FeedItemData {
  id: string;
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
    icon?: string;
  };
  publishedAt: string;
}

interface FeedItemProps {
  item: FeedItemData;
}

export function FeedItem({ item }: FeedItemProps) {
  return (
    <Card className="hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      <article>
        <div className="flex items-center gap-2 mb-2">
          {item.source.icon && (
            <img
              src={item.source.icon}
              alt={item.source.name}
              className="w-4 h-4 rounded"
            />
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {item.source.name}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(item.publishedAt)}
          </span>
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {item.description}
          </p>
        </a>
      </article>
    </Card>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
}
