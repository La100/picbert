"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { VideoData } from "@/lib/cloudflare/r2";
import { MediaPopup } from "../ui/media-popup";

interface VideoLibraryGridProps {
  videos: VideoData[];
}

export function VideoLibraryGrid({ videos }: VideoLibraryGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

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
            onClick={() => setSelectedVideo(video)}
          >
            <div 
              className="relative overflow-hidden rounded-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] aspect-[9/16]"
            >
              <video
                src={`${video.video_url}#t=0.1`}
                className="w-full h-full object-cover"
                preload="metadata"
                playsInline
                muted
              />
            </div>
          </motion.div>
        ))}
      </div>

      {selectedVideo && (
        <MediaPopup
          url={selectedVideo.video_url}
          onClose={() => setSelectedVideo(null)}
          type="video"
        />
      )}
    </>
  );
} 