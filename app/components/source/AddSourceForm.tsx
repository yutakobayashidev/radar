import { useState } from "react";
import { Button } from "../ui/Button";

interface AddSourceFormProps {
  onAdd?: (url: string) => void;
}

export function AddSourceForm({ onAdd }: AddSourceFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && onAdd) {
      onAdd(url.trim());
      setUrl("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter RSS feed URL..."
        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <Button type="submit" disabled={!url.trim()}>
        Add Source
      </Button>
    </form>
  );
}
