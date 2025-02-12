"use client";

import { useState } from "react";
import { VideoLibraryGrid } from "@/components/video-library/VideoLibraryGrid";
import { TagFilter } from "@/components/video-library/TagFilter";
import { Button } from "@/components/ui/button";
import { VideoData } from "@/data/video-library";

// Number of items per page
const ITEMS_PER_PAGE = 15;

interface VideoLibraryContentProps {
  videos: VideoData[];
}

export function VideoLibraryContent({ videos }: VideoLibraryContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter videos based on selected tags
  const filteredVideos = selectedTags.length === 0
    ? videos
    : videos.filter(video =>
        selectedTags.some(selectedTag =>
          video.tags.some(videoTag => 
            videoTag.toLowerCase() === selectedTag.toLowerCase()
          )
        )
      );

  // Calculate pagination
  const totalVideos = filteredVideos.length;
  const totalPages = Math.ceil(totalVideos / ITEMS_PER_PAGE);

  // Get current page videos
  const displayedVideos = filteredVideos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTagSelect = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newSelectedTags);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Video Library</h1>
        <p className="text-muted-foreground">
          Browse and download available videos for your projects
        </p>
      </header>

      <TagFilter
        selectedTags={selectedTags}
        onTagSelect={handleTagSelect}
      />

      <VideoLibraryGrid videos={displayedVideos} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "secondary"}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </>
  );
} 