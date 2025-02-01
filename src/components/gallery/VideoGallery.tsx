"use client";

import { useState } from "react";
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

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
        No videos found
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {videos.map((video, index) => (
          <div key={`${video.id}-${index}`} className="break-inside-auto">
            <div
              className="relative group overflow-hidden cursor-pointer transition-transform"
              onClick={() => setSelectedVideo(video)}
            >
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-70 rounded">
                <div className="flex items-center justify-center h-full">
                  <p className="text-white text-lg font-semibold">
                    View Details
                  </p>
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
                onMouseOver={(e) => e.currentTarget.play()}
                onMouseOut={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <VideoDialog
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
} 