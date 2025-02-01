"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tables } from "@database.types";

type VideoProps = {
  url: string | undefined;
} & Tables<"generated_videos">;

interface VideoSelectorProps {
  videos: VideoProps[];
  selectedVideo: string | null;
  onSelect: (videoId: string) => void;
}

export default function VideoSelector({ videos, selectedVideo, onSelect }: VideoSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-2 rounded-lg border bg-background max-h-[560px] overflow-y-auto">
      {videos.map((video) => (
        <Card
          key={video.id}
          className={cn(
            "relative aspect-[9/16] cursor-pointer overflow-hidden group hover:ring-2 hover:ring-primary transition-all",
            selectedVideo === video.id.toString() && "ring-2 ring-primary"
          )}
          onClick={() => onSelect(video.id.toString())}
        >
          {/* Video Preview */}
          <video
            src={video.url}
            className={`absolute inset-0 w-full h-full object-cover ${
              video.aspect_ratio === "16:9" ? "aspect-video" :
              video.aspect_ratio === "9:16" ? "aspect-[9/16]" :
              "aspect-square"
            }`}
            loop
            muted
            playsInline
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
      ))}
    </div>
  );
} 