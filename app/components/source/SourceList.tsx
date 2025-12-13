import { SourceCard, type SourceData } from "./SourceCard";

interface SourceListProps {
  sources: SourceData[];
  onRemove?: (id: string) => void;
}

export function SourceList({ sources, onRemove }: SourceListProps) {
  if (sources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No sources added yet. Add your first RSS feed to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <SourceCard key={source.id} source={source} onRemove={onRemove} />
      ))}
    </div>
  );
}
