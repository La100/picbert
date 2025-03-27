"use client";
import React from "react";
import useGenerateStore from "@/store/useGenerateStore";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Download, Video, Trash } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, AnimatePresence } from "framer-motion";

interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  output_format?: string;
  id?: string;
  requestId?: string;
  prompt?: string;
}

const GeneratedImages = () => {
  const images = useGenerateStore((state) => state.images);
  const loading = useGenerateStore((state) => state.loading);
  const clearImages = useGenerateStore((state) => state.clearImages);

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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="w-full max-w-4xl mx-auto mb-8 flex justify-between items-center">
          <h2 className="text-lg font-medium">Generated Images</h2>
          {images.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearImages}
              className="flex items-center gap-1"
            >
              <Trash size={14} />
              Clear History
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          {loading && (
            <Card className="w-full border bg-gradient-to-tl from-background to-muted/50 border-primary/10 shadow-lg">
              <CardContent className="p-4 flex items-center justify-center min-h-[400px]">
                <div className="w-48 h-48">
                  <DotLottieReact
                    src="/animations/animation.json"
                    autoplay
                    loop
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          {images.map((image, index) => (
            <motion.div
              key={image.requestId || index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="w-full border bg-gradient-to-tl from-background to-muted/50 border-primary/10 shadow-lg h-full">
                <CardContent className="p-1">
                  <div className="relative flex flex-col items-center justify-center rounded-lg overflow-hidden min-h-[400px]">
                    <motion.img
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      src={image.url}
                      alt={`Generated image for: ${image.prompt || 'No prompt'}`}
                      width={image.width}
                      height={image.height}
                      className="object-contain"
                    />
                    
                    {image.prompt && (
                      <div className="absolute top-2 left-2 right-2 bg-black/60 p-2 rounded text-white text-sm truncate">
                        {image.prompt}
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-fit"
                        onClick={() => handleDownload(image)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      {image.id && (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-fit"
                          onClick={() => {
                            window.location.href = `/video-generation?input_image=${encodeURIComponent(image.url)}`;
                          }}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Video
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GeneratedImages;
