"use client";

import { useState } from "react";
import { Tables } from "@database.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";
import { getImages } from "@/app/actions/image-actions";
import { useEffect } from "react";
import { PaginationComponent } from "@/components/ui/pagination";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

type ImageProps = {
  url: string | undefined;
} & Tables<"generated_images">;

interface GalleryImagePickerProps {
  onImageSelect: (imageUrl: string) => void;
}

export function GalleryImagePicker({ onImageSelect }: GalleryImagePickerProps) {
  const [images, setImages] = useState<ImageProps[]>([]);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 20;
  const [lastImagesCount, setLastImagesCount] = useState(6);

  const loadImages = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await getImages(page, pageSize);
      if (response.success && response.data) {
        setImages(response.data);
        setTotalCount(response.count || 0);
        setLastImagesCount(response.data.length);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadImages(currentPage);
    }
  }, [open, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          <ImageIcon className="w-4 h-4 mr-2" />
          Choose from Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Image from Gallery</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {isLoading ? (
              Array.from({ length: Math.min(lastImagesCount, 12) }).map((_, index) => (
                <div key={index} className="relative aspect-square">
                  <Skeleton className="w-full h-full rounded" />
                </div>
              ))
            ) : (
              images.map((image, index) => (
                <div
                  key={`${image.id}-${index}`}
                  className="relative group cursor-pointer"
                  onClick={() => {
                    onImageSelect(image.url || "");
                    setOpen(false);
                  }}
                >
                  <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-50 rounded">
                    <div className="flex items-center justify-center h-full">
                      <p className="text-white text-xs font-semibold">Select</p>
                    </div>
                  </div>
                  <div className="relative w-full aspect-square">
                    <Image
                      src={image.url || ""}
                      alt={image.prompt || "Generated image"}
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          
          {totalPages > 1 && (
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 