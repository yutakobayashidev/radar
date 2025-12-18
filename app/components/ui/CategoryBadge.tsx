import { getCategoryByName } from "~/data/types";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const categoryInfo = getCategoryByName(category);
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${categoryInfo.color} ${className}`}>
      {category}
    </span>
  );
}
