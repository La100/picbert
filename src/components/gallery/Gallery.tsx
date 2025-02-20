"use client";

import { useState } from "react";
import { Tables } from "@database.types";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MediaPopup } from "../ui/media-popup";
import { deleteImage } from "@/app/actions/image-actions";
import { toast } from "sonner";
import { PaginationComponent } from "../ui/pagination";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    router.push(`?page=${page}`);
  };

  const handleDelete = async () => {
    if (!selectedImage || isDeleting) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteImage(selectedImage.id.toString(), selectedImage.image_name || "");
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success("Image deleted successfully");
      router.refresh();
      setSelectedImage(null);
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error("Failed to delete image");
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
        className="space-y-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
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

        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </motion.div>

      {selectedImage && (
        <MediaPopup
          url={selectedImage.url || ""}
          onClose={() => setSelectedImage(null)}
          showDelete={true}
          onDelete={handleDelete}
          type="image"
          metadata={[
            {
              label: "Prompt",
              value: selectedImage.prompt || "",
            },
            {
              label: "Created At",
              value: new Date(selectedImage.created_at).toLocaleString(),
            },
          ]}
        />
      )}
    </div>
  );
}
