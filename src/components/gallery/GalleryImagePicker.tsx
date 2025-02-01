"use client";

import { useState } from "react";
import { Tables } from "@database.types";
import Image from "next/image";
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

type ImageProps = {
  url: string | undefined;
} & Tables<"generated_images">;

interface GalleryImagePickerProps {
  onImageSelect: (imageUrl: string) => void;
}

export function GalleryImagePicker({ onImageSelect }: GalleryImagePickerProps) {
  const [images, setImages] = useState<ImageProps[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      const response = await getImages();
      if (response.success && response.data) {
        setImages(response.data);
      }
    };
    loadImages();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          <ImageIcon className="w-4 h-4 mr-2" />
          Choose from Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Image from Gallery</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {images.map((image, index) => (
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
                  <p className="text-white text-sm font-semibold">Select Image</p>
                </div>
              </div>
              <Image
                src={image.url || ""}
                alt={image.prompt || "Generated image"}
                width={image.width || 0}
                height={image.height || 0}
                className="object-cover rounded w-full h-48"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 