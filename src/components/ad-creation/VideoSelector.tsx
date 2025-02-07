"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ugcVideos } from "@/data/ugc-videos";

interface VideoSelectorProps {
  videos: { url: string }[];
  selectedVideo: string | null;
  onSelect: (url: string) => void;
}

export default function VideoSelector({ videos, selectedVideo, onSelect }: VideoSelectorProps) {
  const [activeTab, setActiveTab] = useState<"user" | "ugc">("ugc");

  const renderVideoGrid = (items: { url: string }[]) => (
    <div className="grid grid-cols-3 gap-2">
      {items.map((video, index) => (
        <Card
          key={index}
          className={cn(
            "relative aspect-[9/16] cursor-pointer overflow-hidden group hover:ring-2 hover:ring-primary transition-all",
            selectedVideo === video.url && "ring-2 ring-primary"
          )}
          onClick={() => onSelect(video.url)}
        >
          {/* Video Preview */}
          <div className="absolute inset-0">
            <video
              src={video.url}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
      ))}
    </div>
  );

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "user" | "ugc")} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="ugc">UGC Videos</TabsTrigger>
        <TabsTrigger value="user">Your Videos</TabsTrigger>
      </TabsList>
      
      <TabsContent value="ugc" className="p-2 rounded-lg border bg-background max-h-[560px] overflow-y-auto">
        {ugcVideos.length > 0 ? (
          renderVideoGrid(ugcVideos)
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No UGC videos available
          </div>
        )}
      </TabsContent>

      <TabsContent value="user" className="p-2 rounded-lg border bg-background max-h-[560px] overflow-y-auto">
        {videos.length > 0 ? (
          renderVideoGrid(videos)
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No videos generated yet
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
} 