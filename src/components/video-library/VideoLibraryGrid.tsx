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
      // Check if Web Share API is available (typically on mobile devices)
      if (navigator.share && /mobile|android|ios/i.test(navigator.userAgent)) {
        const response = await fetch(video.video_url);
        const blob = await response.blob();
        const file = new File([blob], 'video.mp4', { type: 'video/mp4' });
        
        await navigator.share({
          files: [file],
          title: 'Download Video',
        });
      } else {
        // Fallback for desktop browsers
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
      }
    } catch (error) {
      console.error("Failed to download/share video:", error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="aspect-auto"
          >
            <div 
              className="relative overflow-hidden rounded-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] aspect-[9/16]"
              onClick={() => setSelectedVideo(video)}
            >
              <img 
                src={video.poster_url || `${video.video_url}#t=0.001`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
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
          <DialogContent className="max-h-[80vh] md:max-h-[90vh] w-auto min-w-[350px] md:min-w-[400px] lg:min-w-[500px] max-w-[800px] p-4 md:p-6">
            <DialogHeader className="space-y-1 md:space-y-2 mb-2 md:mb-4">
              <DialogTitle>Video Preview</DialogTitle>
              <DialogDescription>
                Preview and download the selected video
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 md:space-y-4">
              <div className="relative overflow-hidden rounded-lg aspect-[9/16] bg-black max-h-[60vh] md:max-h-[80vh] mx-auto">
                {selectedVideo && (
                  <video
                    key={selectedVideo.id}
                    src={selectedVideo.video_url}
                    controls
                    autoPlay
                    loop
                    muted
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                )}
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={() => handleDownload(selectedVideo)}
                  className="flex items-center gap-2"
                  size="default"
                  variant="default"
                >
                  <Download className="h-4 w-4 md:h-5 md:w-5" />
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