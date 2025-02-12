"use client";

import { useState, useCallback } from "react";
import { VideoDialog } from "./VideoDialog";
import { Tables } from "@database.types";
import { motion } from "framer-motion";

type BaseMediaItem = {
  id: string;
  url: string;
  created_at: string;
};

type VideoItem = BaseMediaItem & Tables<"generated_videos"> & {
  type: 'video';
};

type MediaItem = VideoItem;

interface MediaGalleryProps {
  items: MediaItem[];
  showUpload?: boolean;
}

export function MediaGallery({ items, showUpload = false }: MediaGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handleItemClick = useCallback((item: MediaItem) => {
    setSelectedItem(item);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {showUpload && (
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold">Videos</h2>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="aspect-auto"
            >
              <div 
                className="relative overflow-hidden rounded-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                onMouseEnter={(e) => {
                  const video = e.currentTarget.querySelector('video');
                  if (video && video.paused) {
                    video.play().catch(() => {
                      // Ignore playback errors
                    });
                  }
                }}
                onMouseLeave={(e) => {
                  const video = e.currentTarget.querySelector('video');
                  if (video) {
                    video.pause();
                    video.currentTime = 0;
                  }
                }}
                onClick={() => handleItemClick(item)}
              >
                <video 
                  src={item.url}
                  className="w-full h-auto object-cover"
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={`${item.url}#t=0.001`}
                  onLoadedMetadata={(e) => {
                    e.currentTarget.currentTime = 0;
                  }}
                  onError={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    const video = e.currentTarget;
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {page}
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {selectedItem && (
        <VideoDialog
          video={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
} 