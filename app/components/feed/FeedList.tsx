import { FeedItem, type FeedItemData } from "./FeedItem";

interface FeedListProps {
  items: FeedItemData[];
}

export function FeedList({ items }: FeedListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No feed items yet. Add some sources to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}
    </div>
  );
}
