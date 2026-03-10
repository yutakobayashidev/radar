import { useState, useMemo } from "react";
import { AppLayout } from "~/components/layout";
import { NostrDeckColumn, NostrNotificationColumn, NostrReactionColumn } from "~/components/feed";
import { useNostr } from "~/hooks/useNostr";
import { categoryList, getCategoryBySlug } from "~/data/types";
import type { NostrProfile } from "~/hooks/useNostr";
import type { Route } from "./+types/nostr";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nostr - Radar" },
    { name: "description", content: "Nostr feed" },
  ];
}

function ComposeForm({
  onPublish,
  isPublishing,
}: {
  onPublish: (content: string) => Promise<void>;
  isPublishing: boolean;
}) {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    await onPublish(text);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="px-3 py-2 border-b border-gray-200">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className="w-full text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
      />
      <div className="flex justify-end mt-1.5">
        <button
          type="submit"
          disabled={isPublishing || !content.trim()}
          className="px-3 py-1 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPublishing ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}

function CategoryDropdown({
  pubkey,
  getUserCategories,
  addToCategory,
  removeFromCategory,
}: {
  pubkey: string;
  getUserCategories: (pk: string) => string[];
  addToCategory: (slug: string, pk: string) => Promise<void>;
  removeFromCategory: (slug: string, pk: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const cats = getUserCategories(pubkey);
  const editableCats = categoryList.filter((c) => c.slug !== "all");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
      >
        Edit
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-48">
          {editableCats.map((cat) => {
            const checked = cats.includes(cat.slug);
            return (
              <label
                key={cat.slug}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    if (checked) {
                      void removeFromCategory(cat.slug, pubkey);
                    } else {
                      void addToCategory(cat.slug, pubkey);
                    }
                  }}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-gray-700">{cat.name}</span>
              </label>
            );
          })}
          <div className="border-t border-gray-100 mt-1 pt-1 px-3 pb-1">
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryManagerColumn({
  follows,
  profiles,
  isOwner,
  getUserCategories,
  addToCategory,
  removeFromCategory,
}: {
  follows: string[];
  profiles: Map<string, NostrProfile>;
  isOwner: boolean;
  getUserCategories: (pk: string) => string[];
  addToCategory: (slug: string, pk: string) => Promise<void>;
  removeFromCategory: (slug: string, pk: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");

  const filteredFollows = useMemo(() => {
    if (!search.trim()) return follows;
    const q = search.toLowerCase();
    return follows.filter((pk) => {
      const p = profiles.get(pk);
      const name = (p?.display_name || p?.name || pk.slice(0, 8)).toLowerCase();
      return name.includes(q);
    });
  }, [follows, profiles, search]);

  return (
    <div className="flex flex-col h-full w-96 flex-shrink-0 bg-white overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 bg-white text-gray-900">
        <span className="text-sm font-semibold">Categories</span>
      </div>
      <div className="px-3 py-2 border-b border-gray-200">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredFollows.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400">
            No users found
          </div>
        ) : (
          filteredFollows.map((pk) => {
            const profile = profiles.get(pk);
            const displayName = profile?.display_name || profile?.name || pk.slice(0, 8);
            const cats = getUserCategories(pk);

            return (
              <div key={pk} className="px-3 py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  {profile?.picture ? (
                    <img src={profile.picture} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900 truncate">{displayName}</div>
                  </div>
                  {isOwner && (
                    <CategoryDropdown
                      pubkey={pk}
                      getUserCategories={getUserCategories}
                      addToCategory={addToCategory}
                      removeFromCategory={removeFromCategory}
                    />
                  )}
                </div>
                {cats.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 ml-9">
                    {cats.map((slug) => {
                      const cat = getCategoryBySlug(slug);
                      return (
                        <span
                          key={slug}
                          className={`text-[10px] px-1.5 py-0.5 rounded ${cat.color}`}
                        >
                          {cat.name}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function Nostr() {
  const {
    signerPubkey,
    ownerHex,
    follows,
    myNotes,
    timelineNotes,
    taggedNotes,
    globalNotes,
    notifications,
    reactions,
    noteStats,
    profiles,
    isConnected,
    isLoggingIn,
    isOwner,
    isPublishing,
    hasExtension,
    categoryLists,
    login,
    logout,
    publish,
    addToCategory,
    removeFromCategory,
    getUserCategories,
  } = useNostr();

  const ownerProfile = ownerHex ? profiles.get(ownerHex) : undefined;

  const myNotesHeader = (
    <div className="border-b border-gray-200">
      {ownerProfile ? (
        <div className="px-3 py-3">
          <div className="flex items-center gap-2.5">
            {ownerProfile.picture ? (
              <img
                src={ownerProfile.picture}
                alt=""
                className="w-12 h-12 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-100 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-gray-900 truncate">
                {ownerProfile.display_name || ownerProfile.name}
              </div>
              {ownerProfile.name && ownerProfile.display_name && (
                <div className="text-xs text-gray-400 truncate">
                  @{ownerProfile.name}
                </div>
              )}
            </div>
          </div>
          {ownerProfile.about && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
              {ownerProfile.about}
            </p>
          )}
        </div>
      ) : (
        <div className="px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex-shrink-0 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
              <div className="h-2.5 bg-gray-100 rounded w-16 animate-pulse" />
            </div>
          </div>
        </div>
      )}
      {hasExtension && (
        <div className="px-3 pb-2">
          {signerPubkey ? (
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={login}
              disabled={isLoggingIn}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? "Connecting..." : "Login with NIP-07"}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <AppLayout title="Nostr" isDeckMode>
      {!isConnected ? (
        <div className="text-center py-12 text-gray-500">
          Connecting to relays...
        </div>
      ) : (
        <div className="flex gap-px h-full overflow-x-auto snap-x snap-mandatory bg-gray-200">
          <NostrDeckColumn
            title="My Notes"
            notes={myNotes}
            profiles={profiles}
            noteStats={noteStats}
            headerContent={
              <>
                {myNotesHeader}
                {isOwner && (
                  <ComposeForm onPublish={publish} isPublishing={isPublishing} />
                )}
              </>
            }
          />
          <NostrDeckColumn
            title="Timeline"
            notes={timelineNotes}
            profiles={profiles}
            noteStats={noteStats}
          />
          <NostrDeckColumn
            title="Tagged"
            notes={taggedNotes}
            profiles={profiles}
            noteStats={noteStats}
          />
          <NostrNotificationColumn
            title="Notifications"
            notifications={notifications}
            profiles={profiles}
          />
          <NostrReactionColumn
            title="Reactions"
            reactions={reactions}
            profiles={profiles}
          />
          <CategoryManagerColumn
            follows={follows}
            profiles={profiles}
            isOwner={isOwner}
            getUserCategories={getUserCategories}
            addToCategory={addToCategory}
            removeFromCategory={removeFromCategory}
          />
          <NostrDeckColumn
            title="Global"
            notes={globalNotes}
            profiles={profiles}
            noteStats={noteStats}
          />
        </div>
      )}
    </AppLayout>
  );
}
