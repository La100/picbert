"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./button";
import Image from "next/image";
import { Download, Trash2, X, Video } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "./skeleton";
import { useState } from "react";

interface MediaPopupProps {
  url: string;
  onClose: () => void;
  showDelete?: boolean;
  onDelete?: () => Promise<void>;
  metadata?: {
    label: string;
    value: string;
  }[];
  type: 'image' | 'video';
  onUseInVideo?: () => void;
}

export function MediaPopup({
  url,
  onClose,
  showDelete = false,
  onDelete,
  metadata,
  type,
  onUseInVideo
}: MediaPopupProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = async () => {
    try {
      if (!url) return;

      if (navigator.share && /mobile|android|ios/i.test(navigator.userAgent)) {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], `file.${type === 'video' ? 'mp4' : 'png'}`, { 
          type: type === 'video' ? 'video/mp4' : 'image/png' 
        });
        
        await navigator.share({
          files: [file],
          title: 'Download Media',
        });
      } else {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `file.${type === 'video' ? 'mp4' : 'png'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        toast.success("Download started");
      }
    } catch (error) {
      console.error("Failed to download:", error);
      toast.error("Failed to download");
    }
  };

  const promptMetadata = metadata?.find(
    item => item.label.toLowerCase() === 'prompt'
  );

  return (
    <AnimatePresence>
      <Dialog open={true} onOpenChange={onClose}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
        <DialogContent className="max-w-full w-[90%] sm:w-[85%] sm:max-w-2xl mx-auto my-4 p-4 sm:p-6 [&>button]:hidden max-h-[95vh] overflow-y-auto z-50 bg-background/95 shadow-[0_2px_32px_rgba(0,0,0,0.08)]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          >
            <DialogTitle className="sr-only">
              {type === 'video' ? 'Video Preview' : 'Image Preview'}
            </DialogTitle>
            <div className="pb-4">
              <motion.div 
                className="flex justify-between items-center gap-2 sm:gap-4 mb-4 pt-4 "
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex gap-2 sm:gap-4">
                  <Button
                    size="icon"
                    variant="default"
                    onClick={handleDownload}
                    className="h-9 w-12 sm:w-14"
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                  {showDelete && onDelete && (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={onDelete}
                      className="h-9 w-12 sm:w-14"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                  {type === 'image' && onUseInVideo && (
                    <Button
                      size="icon"
                      onClick={onUseInVideo}
                      className="h-9 w-12 sm:w-14"
                    >
                      <Video className="h-4 w-4" />
                      <span className="sr-only">Use in Video Generation</span>
                    </Button>
                  )}
                </div>
                <Button
                  size="icon"
                  onClick={onClose}
                  className="h-9 w-12 sm:w-14"
                >
                  <X className="h-8 w-8" />
                  <span className="sr-only">Close</span>
                </Button>
              </motion.div>

              <motion.div 
                className="relative w-full flex justify-center items-center"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {type === 'video' ? (
                  <div className="relative w-full h-[65vh] sm:h-[70vh] rounded-xl border border-border/20 mb-4 overflow-hidden bg-transparent">
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Skeleton className="w-full h-full rounded-xl" />
                      </div>
                    )}
                    <video
                      src={url}
                      controls
                      preload="metadata"
                      playsInline
                      className="absolute inset-0 w-full h-full object-contain bg-transparent"
                      onLoadedData={() => setIsLoading(false)}
                      onLoadStart={() => setIsLoading(true)}
                      onError={(e) => {
                        console.error("Video loading error:", e);
                        toast.error("Error loading video");
                        setIsLoading(false);
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-[65vh] sm:h-[70vh] rounded-xl border border-border/20 mb-4 overflow-hidden">
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Skeleton className="w-full h-full rounded-xl" />
                      </div>
                    )}
                    <Image
                      src={url}
                      alt="Preview"
                      fill
                      className="object-contain"
                      sizes="100vw"
                      onLoadingComplete={() => setIsLoading(false)}
                    />
                  </div>
                )}
              </motion.div>

              {promptMetadata && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex flex-col gap-4 animate-in fade-in-50 duration-500">
                    <div className="bg-secondary/5 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Prompt</span>
                      </div>
                      <p className="text-foreground/90 text-sm sm:text-base font-medium leading-relaxed">
                        {promptMetadata.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
} 