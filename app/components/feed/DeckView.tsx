import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useFetcher } from "react-router";
import { useInView } from "react-intersection-observer";
import type {
  RadarItemWithCategory,
  TweetMetadata,
  DeckData,
  FetchRadarItemsResponse,
  Kind,
  Period,
} from "~/data/types";
import {
  getDomainFromUrl,
  formatRelativeTime,
  getCategoryBySlug,
  categoryList,
} from "~/data/types";
import { Favicon } from "~/components/ui";

const URL_REGEX =
  /(?:https?:\/\/|(?<![/@\w])(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:com|org|net|io|dev|co|jp|me|app|xyz|info|edu|gov)(?:\/[^\s)]*)?)/gi;

function LinkifiedText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const url = match[0];
    const index = match.index;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    const href = url.startsWith("http") ? url : `https://${url}`;
    parts.push(
      <a
        key={index}
        href={href}
        onClick={(e) => e.stopPropagation()}
        className="text-sky-600 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {url}
      </a>,
    );

    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span>{parts}</span>;
}

function FeedCard({ item }: { item: RadarItemWithCategory }) {
  const meta = item.metadata as TweetMetadata | null;
  const isTweet = item.type === "tweet";
  const domain = getDomainFromUrl(item.url);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-3 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-2.5">
        {isTweet && meta?.icon ? (
          <img
            src={meta.icon}
            alt=""
            className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 mt-0.5 flex items-center justify-center">
            <Favicon domain={domain} size={18} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="font-medium text-gray-900 truncate">
              {item.sourceName}
            </span>
            {isTweet && meta?.handle && (
              <span className="truncate">@{meta.handle}</span>
            )}
            <span>·</span>
            <span className="flex-shrink-0">
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>

          {isTweet ? (
            <p className="text-sm text-gray-800 mt-1 whitespace-pre-line line-clamp-6 leading-relaxed">
              <LinkifiedText text={item.summary} />
            </p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-2 leading-snug">
                {item.title}
              </p>
              <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="w-full aspect-[2/1] object-cover"
                  />
                )}
                <div className="px-2.5 py-1.5 bg-gray-50 text-xs text-gray-500 flex items-center gap-1.5 truncate">
                  <Favicon domain={domain} size={12} />
                  <span>{domain}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </a>
  );
}

const DECK_ITEMS_PER_PAGE = 10;

function DeckColumn({
  categorySlug,
  initialItems,
  initialHasMore,
  selectedKind,
  selectedPeriod,
}: {
  categorySlug: string;
  initialItems: RadarItemWithCategory[];
  initialHasMore: boolean;
  selectedKind: Kind;
  selectedPeriod: Period;
}) {
  const cat = getCategoryBySlug(categorySlug);
  const fetcher = useFetcher<FetchRadarItemsResponse>();
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    setItems(initialItems);
    setHasMore(initialHasMore);
    setPage(1);
  }, [initialItems, initialHasMore]);

  useEffect(() => {
    const data = fetcher.data;
    if (data?.radarItems) {
      setItems((prev) => [...prev, ...data.radarItems]);
      setHasMore(data.hasMore);
      isLoadingRef.current = false;
    }
  }, [fetcher.data]);

  const loadMore = useCallback(() => {
    if (!hasMore || fetcher.state !== "idle" || isLoadingRef.current) return;
    isLoadingRef.current = true;
    const nextPage = page + 1;
    setPage(nextPage);
    const params = new URLSearchParams({
      page: String(nextPage),
      category: categorySlug,
    });
    if (selectedKind !== "all") params.set("kind", selectedKind);
    fetcher.load(`/api/radar-items?${params.toString()}`);
  }, [hasMore, page, fetcher, categorySlug, selectedKind]);

  const { ref: sentinelRef, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  useEffect(() => {
    if (inView && hasMore && fetcher.state === "idle") {
      loadMore();
    }
  }, [inView, hasMore, fetcher.state, loadMore]);

  const filteredItems = items.filter((f) => {
    if (selectedPeriod === "All") return true;
    const now = new Date();
    const itemDate = new Date(f.timestamp);
    if (selectedPeriod === "Today") {
      return itemDate.toDateString() === now.toDateString();
    }
    if (selectedPeriod === "Month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return itemDate >= oneMonthAgo;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full w-96 flex-shrink-0 bg-white overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 bg-white text-gray-900">
        <span className="text-sm font-semibold">{cat.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400">
            アイテムなし
          </div>
        ) : (
          filteredItems.map((item) => <FeedCard key={item.id} item={item} />)
        )}

        {hasMore && (
          <div ref={sentinelRef} className="py-3 flex justify-center">
            {fetcher.state !== "idle" && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface DeckViewProps {
  deckData: DeckData;
  selectedKind: Kind;
  selectedPeriod: Period;
}

export function DeckView({ deckData, selectedKind, selectedPeriod }: DeckViewProps) {
  const activeCategories = categoryList
    .filter((cat) => cat.slug !== "all")
    .filter((cat) => {
      const col = deckData[cat.slug];
      return col && col.items.length > 0;
    });

  if (activeCategories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        該当する記事がありません
      </div>
    );
  }

  return (
    <div className="flex gap-px h-full overflow-x-auto snap-x snap-mandatory bg-gray-200">
      {activeCategories.map((cat) => {
        const col = deckData[cat.slug]!;
        return (
          <DeckColumn
            key={cat.slug}
            categorySlug={cat.slug}
            initialItems={col.items}
            initialHasMore={col.hasMore}
            selectedKind={selectedKind}
            selectedPeriod={selectedPeriod}
          />
        );
      })}
    </div>
  );
}
