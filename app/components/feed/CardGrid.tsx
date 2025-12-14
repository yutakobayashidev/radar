import type { RadarItem } from "~/data/types";
import { getDomainFromUrl } from "~/data/types";
import { Favicon, CategoryBadge } from "~/components/ui";

interface CardGridProps {
  items: RadarItem[];
}

export function CardGrid({ items }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300"
        >
          <div className="aspect-video bg-gray-100">
            <img
              src={item.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3">
            <div className="flex items-center gap-1.5 mb-1.5 text-xs text-gray-400">
              <Favicon domain={getDomainFromUrl(item.url)} />
              <span className="truncate">{item.sourceName}</span>
              <span>·</span>
              <span className="flex-shrink-0">{item.timestamp}</span>
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
      ))}
    </div>
  );
}
