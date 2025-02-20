"use client";
import React from "react";
import useVideoGenerateStore from "@/store/useVideoGenerateStore";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { LoadingAnimation } from "../shared/LoadingAnimation";
import { motion, AnimatePresence } from "framer-motion";

const GeneratedVideos = () => {
  const videos = useVideoGenerateStore((state) => state.videos);
  const loading = useVideoGenerateStore((state) => state.loading);

  if (!loading && videos.length === 0) return null;

  const video = videos[0];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-1">
            <div 
              className={cn(
                "relative flex items-center justify-center rounded-lg overflow-hidden min-h-[400px]",
                {
                  "aspect-video": video?.aspect_ratio === "16:9",
                  "aspect-[9/16]": video?.aspect_ratio === "9:16",
                  "aspect-square": video?.aspect_ratio === "1:1",
                }
              )}
            >
              {loading ? (
                <LoadingAnimation />
              ) : (
                <motion.video
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={video.url}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default GeneratedVideos; 