import { useState } from "react";
import { Sidebar } from "./Sidebar";
import type { Source, RadarItem } from "~/data/types";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  headerContent?: React.ReactNode;
  selectedSource?: string;
  setSelectedSource?: (source: string) => void;
  showSourceFilter?: boolean;
  sources?: Source[];
  radarItems?: RadarItem[];
}

export function AppLayout({
  children,
  title,
  headerContent,
  selectedSource = "all",
  setSelectedSource,
  showSourceFilter = false,
  sources,
  radarItems,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        showSourceFilter={showSourceFilter}
        sources={sources}
        radarItems={radarItems}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 -ml-1.5 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-base font-medium text-gray-900">{title}</h2>
            </div>
            {headerContent}
          </div>
        </header>

        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
