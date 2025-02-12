"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ClientVideo } from "@/app/actions/client-video-actions";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface VideoLibraryGridProps {
  videos: ClientVideo[];
}

export function VideoLibraryGrid({ videos }: VideoLibraryGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<ClientVideo | null>(null);

  const handleDownload = async (video: ClientVideo) => {
    try {
      const response = await fetch(video.video_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download video:", error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="aspect-auto"
          >
            <div 
              className="relative overflow-hidden rounded-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              onMouseEnter={(e) => {
                const videoEl = e.currentTarget.querySelector('video');
                if (videoEl && videoEl.paused) {
                  videoEl.play().catch(() => {
                    // Ignore playback errors
                  });
                }
              }}
              onMouseLeave={(e) => {
                const videoEl = e.currentTarget.querySelector('video');
                if (videoEl) {
                  videoEl.pause();
                  videoEl.currentTime = 0;
                }
              }}
              onClick={() => setSelectedVideo(video)}
            >
              <video 
                src={video.video_url}
                className="w-full h-auto object-cover"
                loop
                muted
                playsInline
                preload="metadata"
                poster={`${video.video_url}#t=0.001`}
                onLoadedMetadata={(e) => {
                  e.currentTarget.currentTime = 0;
                }}
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex flex-wrap gap-1">
                  {video.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedVideo && (
        <Dialog open onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-[90vw] w-full lg:max-w-[1200px]">
            <DialogHeader>
              <DialogTitle>Video Preview</DialogTitle>
              <DialogDescription>
                Preview and download the selected video
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <video
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={() => handleDownload(selectedVideo)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Video
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 