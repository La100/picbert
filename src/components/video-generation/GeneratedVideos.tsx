"use client";
import React, { useEffect, useState } from "react";
import useVideoGenerateStore from "@/store/useVideoGenerateStore";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { LoadingAnimation } from "../shared/LoadingAnimation";
import { motion, AnimatePresence } from "framer-motion";
import { getVideos } from "@/app/actions/video-actions";

interface Video {
  url: string;
  prompt: string;
  input_image: string;
  aspect_ratio: "16:9" | "9:16" | "1:1";
  duration: "5" | "10";
}

const GeneratedVideos = () => {
  const storeVideos = useVideoGenerateStore((state) => state.videos);
  const loading = useVideoGenerateStore((state) => state.loading);
  const [dbVideos, setDbVideos] = useState<Video[]>([]);
  
  // Fetch videos from the database when component mounts or store videos change
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const result = await getVideos(1, 5); // Get the most recent 5 videos
        if (result.success && result.data) {
          setDbVideos(result.data as Video[]);
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      }
    };
    
    fetchVideos();
    
    // Add a 2 second interval to check for new videos during loading state
    let interval: NodeJS.Timeout | null = null;
    if (loading) {
      interval = setInterval(fetchVideos, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, storeVideos.length]); // Re-fetch when loading state changes or store videos are added
  
  // Combine store videos (from current session) with database videos
  const combinedVideos = [...storeVideos, ...dbVideos.filter(
    // Filter out duplicates based on URL
    dbVideo => !storeVideos.some(storeVideo => storeVideo.url === dbVideo.url)
  )];
  
  if (!loading && combinedVideos.length === 0) return null;

  return (
    <div className="space-y-4 w-full max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Your Generated Videos</h3>
      <AnimatePresence mode="wait">
        {combinedVideos.map((video, index) => (
          <motion.div
            key={video.url || `video-${index}`}
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
                  {loading && index === 0 ? (
                    <LoadingAnimation />
                  ) : video.url ? (
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
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Loading video...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GeneratedVideos; 