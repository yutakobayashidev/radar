interface FaviconProps {
  domain?: string;
  size?: number;
  className?: string;
}

export function Favicon({ domain, size = 16, className = "" }: FaviconProps) {
  if (!domain) {
    return (
      <div
        className={`w-4 h-4 rounded bg-gray-200 flex items-center justify-center ${className}`}
      >
        <svg
          className="w-3 h-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`}
      alt=""
      className={`rounded ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
