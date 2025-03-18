"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { VideoData } from "@/lib/cloudflare/r2";
import { MediaPopup } from "../ui/media-popup";
import Image from "next/image";

interface VideoLibraryGridProps {
  videos: VideoData[];
}

export function VideoLibraryGrid({ videos }: VideoLibraryGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [postersLoaded, setPostersLoaded] = useState<{[key: string]: boolean}>({});

  // Preładuj postery
  useEffect(() => {
    videos.forEach(video => {
      if (video.poster_url) {
        const img = new globalThis.Image();
        img.src = video.poster_url;
        img.onload = () => {
          setPostersLoaded(prev => ({
            ...prev,
            [video.id]: true
          }));
        };
        img.onerror = () => {
          console.error(`Nie udało się załadować postera dla ${video.id}`);
          setPostersLoaded(prev => ({
            ...prev,
            [video.id]: false
          }));
        };
      }
    });
  }, [videos]);

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
              {postersLoaded[video.id] === false ? (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span>Loading video...</span>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {video.poster_url && (
                    <Image
                      src={video.poster_url}
                      alt={`Poster for ${video.id}`}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      priority={index < 4} // Priorytetowo ładuj pierwsze 4 obrazy
                      onError={() => console.error(`Error loading poster: ${video.id}`)}
                    />
                  )}
                </div>
              )}
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