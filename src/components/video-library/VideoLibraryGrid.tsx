"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ClientVideo } from "@/app/actions/client-video-actions";
import { Badge } from "@/components/ui/badge";
import { MediaPopup } from "../ui/media-popup";

interface VideoLibraryGridProps {
  videos: ClientVideo[];
}

export function VideoLibraryGrid({ videos }: VideoLibraryGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<ClientVideo | null>(null);

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
        <MediaPopup
          url={selectedVideo.video_url}
          onClose={() => setSelectedVideo(null)}
     
       
          type="video"
        />
      )}
    </>
  );
} 