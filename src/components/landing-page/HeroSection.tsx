"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const videos = [
  "https://api.facesfactory.com/storage/v1/object/public/images//1.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//3.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//4.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//5.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//2.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//6.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//7.mp4"
];

// Skeleton loader component for videos
const VideoSkeletonLoader = () => {
  return (
    <div className="flex gap-4 mt-16 pt-16 animate-pulse">
      {Array(7).fill(0).map((_, index) => (
        <div key={index} className="flex-shrink-0">
          <Skeleton className="w-[280px] aspect-[9/16] rounded-lg bg-muted-foreground/10" />
        </div>
      ))}
    </div>
  );
};

const HeroSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // For production reliability
  useEffect(() => {
    let mounted = true;
    let loadedCount = 0;
    
    const preloadVideos = () => {
      videos.forEach((url) => {
        const videoEl = document.createElement('video');
        videoEl.src = url;
        videoEl.preload = 'auto';
        
        const updateProgress = () => {
          if (!mounted) return;
          
          loadedCount++;
          const progress = Math.floor((loadedCount / videos.length) * 100);
          setLoadingProgress(progress);
          
          if (loadedCount >= videos.length) {
            setIsLoading(false);
          }
        };
        
        videoEl.addEventListener('loadeddata', updateProgress);
        videoEl.addEventListener('error', () => {
          console.error(`Failed to load video: ${url}`);
          updateProgress(); // Still count as loaded to not block UI
        });
      });
    };
    
    preloadVideos();
    
    // Failsafe timeout - production quality requirement
    const timer = setTimeout(() => {
      if (mounted) {
        setIsLoading(false);
      }
    }, 5000);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);
  
  // Calculate animation distance - number of videos * (width + gap)
  const distance = videos.length * (280 + 16);
  
  // Double the videos to ensure smooth looping
  const allVideos = [...videos, ...videos];
  
  return (
    <div className="w-full overflow-hidden">
      {isLoading ? (
        <div className="relative">
          <VideoSkeletonLoader />
          <div className="mt-4 w-full flex justify-center">
            <div className="w-64 h-2 bg-muted-foreground/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 rounded-full" 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <motion.div 
            className="flex gap-4 mt-16 pt-16"
            initial={{ x: 0 }}
            animate={{ 
              x: -distance
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 25,
                ease: "linear",
              },
            }}
            style={{ willChange: "transform" }}
          >
            {allVideos.map((video, index) => (
              <div key={index} className="flex-shrink-0">
                <video
                  src={video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-[280px] aspect-[9/16] rounded-lg object-cover"
                />
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
