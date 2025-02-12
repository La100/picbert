"use client";

import { Badge } from "@/components/ui/badge";
import { availableTags } from "@/data/video-tags";

interface TagFilterProps {
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

export function TagFilter({ selectedTags, onTagSelect }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {availableTags.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTags.includes(tag) ? "default" : "secondary"}
          className="cursor-pointer hover:bg-primary/90 transition-colors"
          onClick={() => onTagSelect(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
} 