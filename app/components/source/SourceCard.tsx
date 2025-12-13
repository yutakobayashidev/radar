import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export interface SourceData {
  id: string;
  name: string;
  url: string;
  icon?: string;
  type: "rss" | "atom" | "json";
  lastFetched?: string;
  itemCount: number;
}

interface SourceCardProps {
  source: SourceData;
  onRemove?: (id: string) => void;
}

export function SourceCard({ source, onRemove }: SourceCardProps) {
  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {source.icon ? (
          <img
            src={source.icon}
            alt={source.name}
            className="w-10 h-10 rounded-lg"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {source.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {source.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {source.itemCount} items
            {source.lastFetched && ` • Last updated ${formatLastFetched(source.lastFetched)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase">
          {source.type}
        </span>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(source.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Remove
          </Button>
        )}
      </div>
    </Card>
  );
}

function formatLastFetched(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return date.toLocaleDateString();
}
