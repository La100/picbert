"use client";

import { useState } from "react";
import { VideoLibraryGrid } from "@/components/video-library/VideoLibraryGrid";
import { VideoData } from "@/lib/cloudflare/r2";
import { PaginationComponent } from "@/components/ui/pagination";

// Number of items per page
const ITEMS_PER_PAGE = 15;

interface VideoLibraryContentProps {
  videos: VideoData[];
}

export function VideoLibraryContent({ videos }: VideoLibraryContentProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalVideos = videos.length;
  const totalPages = Math.ceil(totalVideos / ITEMS_PER_PAGE);

  // Get current page videos
  const displayedVideos = videos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Video Library</h1>
        <p className="text-muted-foreground">
          Browse and download available videos for your projects
        </p>
      </header>

      <VideoLibraryGrid videos={displayedVideos} />

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
} 