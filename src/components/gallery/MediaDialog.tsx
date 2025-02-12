"use client";

import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Tables } from "@database.types";

type BaseMediaItem = {
  id: string;
  url: string;
  created_at: string;
};

type VideoItem = BaseMediaItem & Tables<"generated_videos"> & {
  type: 'video';
};

type ImageItem = BaseMediaItem & Tables<"generated_images"> & {
  type: 'image';
};

type MediaItem = VideoItem | ImageItem;

interface MediaDialogProps {
  item: MediaItem;
  onClose: () => void;
}

export function MediaDialog({ item, onClose }: MediaDialogProps) {
 
  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative max-w-4xl w-full">
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 text-white hover:text-gray-300 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Close
          </button>
          {item.type === 'video' ? (
            <video
              src={item.url}
              className="w-full h-auto object-contain rounded-lg"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={item.url}
              alt={item.prompt || "Selected image"}
              className="w-full h-auto object-contain rounded-lg"
            />
          )}
          {item.prompt && (
            <div className="mt-4 p-4 bg-background/80 backdrop-blur rounded-lg">
              <p className="text-foreground">{item.prompt}</p>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 