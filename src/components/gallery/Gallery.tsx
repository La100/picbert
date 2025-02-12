"use client";

import { useState } from "react";
import { ImageDialog } from "./ImageDialog";
import { Tables } from "@database.types";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type ImageProps = {
  url: string | undefined;
} & Tables<"generated_images">;

interface GalleryProps {
  images: ImageProps[];
  currentPage: number;
  totalCount: number;
  pageSize?: number;
}

export function Gallery({ images, currentPage, totalCount, pageSize = 12 }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageProps | null>(null);
  const router = useRouter();
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    router.push(`?page=${page}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="break-inside-avoid"
            >
              <div
                className="relative overflow-hidden rounded-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.url || "/placeholder-image.png"}
                  alt={image.prompt || "Generated image"}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>

      {selectedImage && (
        <ImageDialog
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
