import type { FeedItemData } from "../components/feed";
import type { SourceData } from "../components/source";

export const mockSources: SourceData[] = [
  {
    id: "1",
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
    type: "rss",
    lastFetched: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    itemCount: 30,
  },
  {
    id: "2",
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    type: "rss",
    lastFetched: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    itemCount: 25,
  },
  {
    id: "3",
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    type: "atom",
    lastFetched: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    itemCount: 20,
  },
  {
    id: "4",
    name: "Dev.to",
    url: "https://dev.to/feed",
    type: "rss",
    lastFetched: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    itemCount: 15,
  },
];

export const mockFeedItems: FeedItemData[] = [
  {
    id: "1",
    title: "React 19 is Now Stable",
    description:
      "After months of development, React 19 has been officially released with new features including Server Components, improved Suspense, and better performance.",
    url: "https://example.com/react-19",
    source: { name: "Hacker News" },
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    title: "OpenAI Announces GPT-5 Preview",
    description:
      "OpenAI has announced a preview of GPT-5, promising significant improvements in reasoning and multimodal capabilities.",
    url: "https://example.com/gpt-5",
    source: { name: "TechCrunch" },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "3",
    title: "Apple Vision Pro 2 Leaks Reveal Lighter Design",
    description:
      "New leaks suggest Apple is working on a significantly lighter Vision Pro 2, addressing one of the main criticisms of the first generation.",
    url: "https://example.com/vision-pro-2",
    source: { name: "The Verge" },
    publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "4",
    title: "Building Type-Safe APIs with tRPC and Next.js",
    description:
      "A comprehensive guide to building end-to-end type-safe APIs using tRPC with Next.js App Router.",
    url: "https://example.com/trpc-guide",
    source: { name: "Dev.to" },
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "5",
    title: "GitHub Copilot Now Supports Claude Models",
    description:
      "GitHub has announced support for Anthropic's Claude models in GitHub Copilot, giving developers more options for AI-assisted coding.",
    url: "https://example.com/copilot-claude",
    source: { name: "TechCrunch" },
    publishedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
  },
  {
    id: "6",
    title: "Rust 2.0 RFC Published",
    description:
      "The Rust team has published an RFC for Rust 2.0, outlining potential breaking changes and new language features.",
    url: "https://example.com/rust-2",
    source: { name: "Hacker News" },
    publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "7",
    title: "Tesla Robotaxi Service Launches in San Francisco",
    description:
      "Tesla has officially launched its robotaxi service in San Francisco, competing with Waymo and Cruise.",
    url: "https://example.com/tesla-robotaxi",
    source: { name: "The Verge" },
    publishedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
  },
  {
    id: "8",
    title: "Understanding Bun's New Bundler",
    description:
      "An in-depth look at Bun's new bundler and how it compares to esbuild, Rollup, and webpack.",
    url: "https://example.com/bun-bundler",
    source: { name: "Dev.to" },
    publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
];
