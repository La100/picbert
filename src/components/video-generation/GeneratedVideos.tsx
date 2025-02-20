"use client";
import React from "react";
import useVideoGenerateStore from "@/store/useVideoGenerateStore";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

const GeneratedVideos = () => {
  const videos = useVideoGenerateStore((state) => state.videos);
 

  if (videos.length === 0) return null;

  const video = videos[0];

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-1">
        <div 
          className={cn(
            "relative flex items-center justify-center rounded-lg overflow-hidden",
            {
              "aspect-video": video.aspect_ratio === "16:9",
              "aspect-[9/16]": video.aspect_ratio === "9:16",
              "aspect-square": video.aspect_ratio === "1:1",
            }
          )}
        >
          <video
            src={video.url}
            controls
            autoPlay
            loop
            muted
            className="w-full h-full object-contain"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedVideos; 