import type { Source } from "~/data/types";
import { getDomainFromUrl, formatRelativeTime } from "~/data/types";
import { Favicon, CategoryBadge } from "~/components/ui";

interface SourcesGridProps {
  sources: Source[];
}

export function SourcesGrid({ sources }: SourcesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sources.map((source) => (
        <a
          key={source.id}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300"
        >
          <div className="flex items-start gap-3 mb-3">
            <Favicon domain={getDomainFromUrl(source.url)} size={32} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {source.name}
              </h3>
              <p className="text-xs text-gray-400 truncate">{getDomainFromUrl(source.url)}</p>
            </div>
            <svg
              className="w-4 h-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{source.description}</p>
          <div className="flex items-center justify-between">
            <CategoryBadge category={source.category} />
            <div className="flex items-center text-xs text-gray-400">
              <span>更新 {formatRelativeTime(source.lastUpdated)}</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
