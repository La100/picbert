"use client";
import React from "react";
import useVideoGenerateStore from "@/store/useVideoGenerateStore";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { LoadingAnimation } from "../shared/LoadingAnimation";
import { motion, AnimatePresence } from "framer-motion";

const GeneratedVideos = () => {
  const storeVideos = useVideoGenerateStore((state) => state.videos);
  const loading = useVideoGenerateStore((state) => state.loading);
  
  // Only use videos from the current session
  const mostRecentVideo = storeVideos.length > 0 ? storeVideos[0] : null;
  
  if (!loading && !mostRecentVideo) return null;

  return (
    <div className="space-y-4 w-full max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Generated Video</h3>
      <AnimatePresence mode="wait">
        {loading && !mostRecentVideo ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="p-1">
                <div 
                  className="relative flex items-center justify-center rounded-lg overflow-hidden min-h-[400px] aspect-[9/16]"
                >
                  <LoadingAnimation />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : mostRecentVideo ? (
          <motion.div
            key={mostRecentVideo.url || "recent-video"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card className="w-full max-w-2xl mx-auto border bg-gradient-to-tl from-background to-muted/50 border-primary/10 shadow-lg">
              <CardContent className="p-1">
                <div 
                  className={cn(
                    "relative flex items-center justify-center rounded-lg overflow-hidden min-h-[400px]",
                    {
                      "aspect-video": mostRecentVideo?.aspect_ratio === "16:9",
                      "aspect-[9/16]": mostRecentVideo?.aspect_ratio === "9:16", 
                      "aspect-square": mostRecentVideo?.aspect_ratio === "1:1",
                    }
                  )}
                >
                  {mostRecentVideo.url ? (
                    <motion.video
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      src={mostRecentVideo.url}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Loading video...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default GeneratedVideos; 