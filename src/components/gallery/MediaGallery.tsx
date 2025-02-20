"use client";

import { useState } from "react";
import { Tables } from "@database.types";
import { motion } from "framer-motion";
import { MediaPopup } from "../ui/media-popup";
import { deleteVideo } from "@/app/actions/video-actions";
import { toast } from "sonner";

type VideoItem = {
  url: string | undefined;
} & Tables<"generated_videos">;

interface MediaGalleryProps {
  items: VideoItem[];
  showUpload?: boolean;
}

export function MediaGallery({ items, showUpload = false }: MediaGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<VideoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handleDelete = async () => {
    if (!selectedItem || isDeleting) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteVideo(selectedItem.id.toString(), selectedItem.video_name);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success("Video deleted successfully");
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to delete video:", error);
      toast.error("Failed to delete video");
    } finally {
      setIsDeleting(false);
    }
  };

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
              onClick={() => setSelectedItem(item)}
            >
              <div 
                className="relative overflow-hidden rounded-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] aspect-[9/16]"
                onMouseEnter={(e) => {
                  const video = e.currentTarget.querySelector('video');
                  if (video && video.paused) {
                    video.play().catch(() => {});
                  }
                }}
                onMouseLeave={(e) => {
                  const video = e.currentTarget.querySelector('video');
                  if (video) {
                    video.pause();
                    video.currentTime = 0;
                  }
                }}
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
        <MediaPopup
          url={selectedItem.url || ""}
          onClose={() => setSelectedItem(null)}
          showDelete={true}
          onDelete={handleDelete}
          type="video"
          metadata={[
            {
              label: "Prompt",
              value: selectedItem.prompt || "",
            }
          ]}
        />
      )}
    </div>
  );
} 