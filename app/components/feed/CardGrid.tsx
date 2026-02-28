import type { RadarItemWithCategory, TweetMetadata } from "~/data/types";
import { getDomainFromUrl, formatRelativeTime } from "~/data/types";
import { Favicon, CategoryBadge } from "~/components/ui";

interface CardGridProps {
  items: RadarItemWithCategory[];
}

function ArticleCard({ item }: { item: RadarItemWithCategory }) {
  const getFallbackImage = (itemId: number) => {
    return `https://picsum.photos/seed/${itemId}/1200/630`;
  };

  return (
    <a
      href={item.url}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300"
    >
      <div className="aspect-video bg-gray-100">
        <img
          src={item.image || getFallbackImage(item.id)}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5 text-xs text-gray-400">
          <Favicon domain={getDomainFromUrl(item.url)} />
          <span className="truncate">{item.sourceName}</span>
          <span>·</span>
          <span className="flex-shrink-0">{formatRelativeTime(item.timestamp)}</span>
        </div>
        <h3 className="font-medium text-sm text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
          {item.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">{item.summary}</p>
        <div className="mt-2">
          <CategoryBadge category={item.category} />
        </div>
      </div>
    </a>
  );
}

function TweetCard({ item }: { item: RadarItemWithCategory }) {
  const meta = item.metadata as TweetMetadata | null;

  return (
    <a
      href={item.url}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 p-3"
    >
      <div className="flex items-start gap-2.5">
        {meta?.icon ? (
          <img
            src={meta.icon}
            alt=""
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-sky-100 flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="font-medium text-gray-900 truncate">{item.sourceName}</span>
            <span>·</span>
            <span className="flex-shrink-0">{formatRelativeTime(item.timestamp)}</span>
          </div>
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-line line-clamp-4">
            {item.summary}
          </p>
          <div className="mt-2">
            <CategoryBadge category={item.category} />
          </div>
        </div>
      </div>
    </a>
  );
}

export function CardGrid({ items }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) =>
        item.type === "tweet" ? (
          <TweetCard key={item.id} item={item} />
        ) : (
          <ArticleCard key={item.id} item={item} />
        )
      )}
    </div>
  );
}

export function TweetTimeline({ items }: CardGridProps) {
  return (
    <div className="max-w-2xl">
      {items.map((item) => {
        const meta = item.metadata as TweetMetadata | null;
        return (
          <div key={item.id} className="bg-white px-4 py-3 border-b border-gray-200">
            <div className="flex items-start gap-3">
              {meta?.icon ? (
                <img
                  src={meta.icon}
                  alt=""
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-sky-100 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-bold text-gray-900">{item.sourceName}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-400">{formatRelativeTime(item.timestamp)}</span>
                </div>
                <p className="text-[15px] text-gray-900 mt-0.5 whitespace-pre-line leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
