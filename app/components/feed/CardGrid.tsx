import type { FeedItem } from "~/data/types";
import { Favicon, CategoryBadge } from "~/components/ui";

interface CardGridProps {
  feeds: FeedItem[];
}

export function CardGrid({ feeds }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {feeds.map((item) => (
        <a
          key={item.id}
          href={item.url}
          className="group block bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all"
        >
          <div className="aspect-video bg-gray-100 overflow-hidden">
            <img
              src={item.image}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          <div className="p-3">
            <div className="flex items-center gap-1.5 mb-1.5 text-xs text-gray-400">
              <Favicon domain={item.domain} />
              <span className="truncate">{item.sourceName}</span>
              <span>·</span>
              <span className="flex-shrink-0">{item.timestamp}</span>
            </div>
            <h3 className="font-medium text-sm text-gray-900 mb-1 group-hover:text-gray-600 transition-colors line-clamp-2">
              {item.title}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2">{item.summary}</p>
            <div className="mt-2">
              <CategoryBadge category={item.category} />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
