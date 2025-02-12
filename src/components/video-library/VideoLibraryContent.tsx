"use client";

import { useState, useEffect } from "react";
import { VideoLibraryGrid } from "@/components/video-library/VideoLibraryGrid";
import { TagFilter } from "@/components/video-library/TagFilter";
import { getClientVideos } from "@/app/actions/client-video-actions";
import { Button } from "@/components/ui/button";
import { ClientVideo } from "@/app/actions/client-video-actions";

interface VideoLibraryContentProps {
  initialVideos: ClientVideo[];
  totalVideos: number;
  availableTags: string[];
}

export function VideoLibraryContent({ 
  initialVideos, 
 
  availableTags 
}: VideoLibraryContentProps) {
  const [videos, setVideos] = useState(initialVideos);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedVideos, setDisplayedVideos] = useState<ClientVideo[]>([]);
  const ITEMS_PER_PAGE = 15;
  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);

  useEffect(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setDisplayedVideos(videos.slice(start, end));
  }, [currentPage, videos]);

  const handleTagSelect = async (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    setCurrentPage(1);
    
    const { data } = await getClientVideos(undefined, newSelectedTags);
    if (data) {
      setVideos(data);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        availableTags={availableTags}
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
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </>
  );
} 