import { categoryColors } from "~/data/types";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${categoryColors[category]} ${className}`}>
      {category}
    </span>
  );
}
