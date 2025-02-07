"use client";

import { useState, useCallback, useMemo } from "react";
import { ImageDialog } from "./ImageDialog";
import { Tables } from "@database.types";
import Image from "next/image";

type ImageProps = {
  url: string | undefined;
} & Tables<"generated_images">;

interface GalleryProps {
  images: ImageProps[];
}

export function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageProps | null>(null);

  const handleImageClick = useCallback((image: ImageProps) => {
    setSelectedImage(image as { url: string } & Tables<"generated_images">);
  }, []);

  const memoizedGalleryContent = useMemo(() => {
    if (images.length === 0) {
      return (
        <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
          No images found
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
        {images.map((image, index) => (
          <div key={`${image.id}-${index}`}>
            <div
              className="relative group cursor-pointer"
              onClick={() => handleImageClick(image)}
            >
              <div className="absolute inset-0 bg-black/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded z-10">
                <div className="flex items-center justify-center h-full">
                  <p className="text-white text-lg font-semibold">View Details</p>
                </div>
              </div>
              <Image
                src={image.url || ""}
                alt={image.prompt || "Generated image"}
                width={image.width || 0}
                height={image.height || 0}
                className="object-cover rounded w-full h-auto"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }, [images, handleImageClick]);

  return (
    <div className="container mx-auto py-8">
      {memoizedGalleryContent}
      {selectedImage && (
        <ImageDialog
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
