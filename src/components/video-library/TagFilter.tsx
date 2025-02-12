"use client";

import { Badge } from "@/components/ui/badge";

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

export function TagFilter({ availableTags, selectedTags, onTagSelect }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {availableTags.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTags.includes(tag) ? "default" : "secondary"}
          className="cursor-pointer hover:opacity-80"
          onClick={() => onTagSelect(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
} 