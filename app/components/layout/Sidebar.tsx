import { NavLink } from "react-router";
import { sources, feedItems } from "~/data/mock";
import { Favicon } from "~/components/ui";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedSource?: string;
  setSelectedSource?: (source: string) => void;
  showSourceFilter?: boolean;
}

export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  selectedSource = "all",
  setSelectedSource,
  showSourceFilter = false,
}: SidebarProps) {
  return (
    <aside
      className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-20 w-60 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out flex-shrink-0`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Feed</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <div className="mb-4">
            <ul className="space-y-0.5">
              <li>
                <NavLink
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span>Feed</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/sources"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>Sources</span>
                </NavLink>
              </li>
            </ul>
          </div>

          {showSourceFilter && setSelectedSource && (
            <div>
              <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-1">
                Filter by Source
              </h2>
              <ul className="space-y-0.5">
                <li>
                  <button
                    onClick={() => {
                      setSelectedSource("all");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      selectedSource === "all"
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="w-4 h-4 rounded bg-gray-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </div>
                    <span className="flex-1 text-left">All</span>
                    <span className="text-xs text-gray-400">{feedItems.length}</span>
                  </button>
                </li>
                {sources.map((source) => (
                  <li key={source.id}>
                    <button
                      onClick={() => {
                        setSelectedSource(source.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                        selectedSource === source.id
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Favicon domain={source.domain} />
                      <span className="flex-1 text-left truncate">{source.name}</span>
                      <span className="text-xs text-gray-400">
                        {feedItems.filter((f) => f.source === source.id).length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
