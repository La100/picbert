"use client";

import { useState, useCallback, useMemo } from "react";
import { VideoDialog } from "./VideoDialog";
import { Tables } from "@database.types";

type VideoProps = {
  url: string | undefined;
} & Tables<"generated_videos">;

interface VideoGalleryProps {
  videos: VideoProps[];
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoProps | null>(null);

  const handleVideoClick = useCallback((video: VideoProps) => {
    setSelectedVideo(video);
  }, []);

  const memoizedGalleryContent = useMemo(() => {
    if (videos.length === 0) {
      return (
        <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
          No videos found
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
        {videos.map((video, index) => (
          <div key={`${video.id}-${index}`}>
            <div
              className="relative group cursor-pointer"
              onClick={() => handleVideoClick(video)}
            >
              <div className="absolute inset-0 bg-black/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded z-10">
                <div className="flex items-center justify-center h-full">
                  <p className="text-white text-lg font-semibold">View Details</p>
                </div>
              </div>
              <video
                src={video.url}
                className={`w-full rounded object-cover ${
                  video.aspect_ratio === "16:9" ? "aspect-video" :
                  video.aspect_ratio === "9:16" ? "aspect-[9/16]" :
                  "aspect-square"
                }`}
                muted
                playsInline
                preload="metadata"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseOut={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }, [videos, handleVideoClick]);

  return (
    <div className="container mx-auto py-8">
      {memoizedGalleryContent}
      {selectedVideo && (
        <VideoDialog
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
} 