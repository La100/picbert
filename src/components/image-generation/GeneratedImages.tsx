"use client";
import React from "react";
import useGenerateStore from "@/store/useGenerateStore";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Download, Video } from "lucide-react";
import { LoadingAnimation } from "../shared/LoadingAnimation";
import { motion, AnimatePresence } from "framer-motion";

interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  output_format?: string;
  id?: string;
}

const GeneratedImages = () => {
  const images = useGenerateStore((state) => state.images);
  const loading = useGenerateStore((state) => state.loading);

  const handleDownload = (image: GeneratedImage) => {
    const fileExtension = image?.output_format?.toLowerCase() || 'png';
    fetch(image.url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `generated-image-${Date.now()}.${fileExtension}`
        );

        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error downloading the image:", error));
  };

  if (!loading && images.length === 0) return null;

  const image = images[0];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card className="w-full max-w-2xl mx-auto  border bg-gradient-to-tl from-background to-muted/50 border-primary/10 shadow-lg">
          <CardContent className="p-1">
            <div className="relative flex items-center justify-center rounded-lg overflow-hidden min-h-[400px]">
              {loading ? (
                <LoadingAnimation />
              ) : (
                <>
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={image.url}
                    alt={`Generated image`}
                    width={image.width}
                    height={image.height}
                    className="object-contain"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                      variant="default"
                      className="w-fit"
                      onClick={() => handleDownload(image)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    {image.id && (
                      <Button
                        variant="default"
                        className="w-fit"
                        onClick={() => {
                          window.location.href = `/video-generation?input_image=${encodeURIComponent(image.url)}`;
                        }}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Generate Video
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default GeneratedImages;
