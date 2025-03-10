"use client";

import { useState } from "react";
import { Tables } from "@database.types";
import { motion } from "framer-motion";
import { MediaPopup } from "../ui/media-popup";
import { deleteVideo } from "@/app/actions/video-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PaginationComponent } from "../ui/pagination";
import Image from "next/image";
import { EmptyState } from "../ui/empty-state";

type VideoItem = {
  url: string | undefined | null;
  input_image: string | null;
} & Tables<"generated_videos">;

interface MediaGalleryProps {
  items: VideoItem[];
  currentPage: number;
  totalCount: number;
  pageSize: number;
}

export function MediaGallery({ items, currentPage, totalCount, pageSize }: MediaGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<VideoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const totalPages = Math.ceil(totalCount / pageSize);

  if (items.length === 0) {
    return <EmptyState type="video" />;
  }

  const handlePageChange = (page: number) => {
    router.push(`?page=${page}`);
  };

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
      router.refresh();
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, index) => (
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
              >
                <Image
                  src={item.input_image || ""}
                  alt={item.prompt || "Video thumbnail"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  quality={80}
                  priority={index < 4}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
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