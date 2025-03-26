"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RainbowButton } from "@/components/ui/rainbow-button";

const videos = [
  "https://api.facesfactory.com/storage/v1/object/public/images//1.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//3.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//4.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//5.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//2.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//6.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//7.mp4"
];

export const HeroSkeleton = () => {
  return (
    <div className="w-full min-h-screen flex flex-col justify-between overflow-hidden px-4 mt-12 md:px-6">
      {/* Skeleton Title Section */}
      <div className="max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center py-8 md:py-12">
        <div className="h-12 md:h-16 bg-gray-800 rounded-md w-3/4 mx-auto mb-2 animate-pulse"></div>
        <div className="h-12 md:h-16 bg-gray-800 rounded-md w-4/5 mx-auto animate-pulse"></div>
        
        <div className="h-8 md:h-12 bg-gray-800/50 rounded-md w-2/3 mx-auto mt-4 animate-pulse"></div>
        
        <div className="mt-6 md:mt-8 flex flex-wrap justify-center items-center gap-2 px-4">
          <div className="h-6 w-20 bg-gray-800 rounded-md animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-800 rounded-full animate-pulse"></div>
          <div className="h-6 w-48 bg-gray-800 rounded-md animate-pulse"></div>
        </div>
        
        <div className="mt-8 md:mt-10">
          <div className="h-4 w-32 bg-gray-800/50 rounded-md mx-auto mb-3 animate-pulse"></div>
          <div className="h-12 w-64 bg-black-600/50 rounded-md mx-auto animate-pulse"></div>
        </div>
      </div>

      {/* Skeleton Video Carousel */}
      <div className="relative mt-auto -mx-4">
        <div className="flex gap-2 md:gap-4 overflow-hidden">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-[200px] md:w-[280px]">
              <div className="w-full aspect-[9/16] rounded-lg bg-gray-800 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const VideoItem = ({ video, index }: { video: string; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.2, // Stagger effect
        ease: "easeOut"
      }}
      className="flex-shrink-0 w-[200px] md:w-[280px]"
    >
      <video
        src={video}
        autoPlay
        loop
        muted
        playsInline
        className="w-full aspect-[9/16] rounded-lg object-cover"
      />
    </motion.div>
  );
};

const VideoCarousel = ({ videoUrls }: { videoUrls: string[] }) => {
  const slideWidth = (280 + 16) * videoUrls.length;
  
  return (
    <motion.div 
      className="flex gap-2 md:gap-4"
      animate={{ 
        x: [-slideWidth/2, -slideWidth * 1.5]
      }}
      transition={{
        x: {
          repeat: Infinity,
          duration: 30,
          ease: "linear",
        },
      }}
      style={{ 
        willChange: "transform",
      }}
    >
      <AnimatePresence>
        {[...videoUrls, ...videoUrls, ...videoUrls].map((video, index) => (
          <VideoItem key={video + index} video={video} index={index % videoUrls.length} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

const HeroSection = () => {
  const [loadedVideos, setLoadedVideos] = React.useState<string[]>([]);
  const [isInitialLoaded, setIsInitialLoaded] = React.useState(false);
  const initialVideosCount = 3; // Start with 3 videos

  // Progressive video loading
  React.useEffect(() => {
    let mounted = true;

    const loadVideo = async (videoUrl: string) => {
      return new Promise<string>((resolve, reject) => {
        const video = document.createElement('video');
        video.src = videoUrl;
        video.onloadeddata = () => resolve(videoUrl);
        video.onerror = reject;
        video.load();
      });
    };

    // Load initial batch of videos
    const loadInitialVideos = async () => {
      try {
        const initialVideos = videos.slice(0, initialVideosCount);
        const loadedInitial = await Promise.all(
          initialVideos.map(loadVideo)
        );
        if (mounted) {
          setLoadedVideos(loadedInitial);
          setIsInitialLoaded(true);
        }
      } catch (error) {
        console.error('Error loading initial videos:', error);
      }
    };

    // Load remaining videos progressively
    const loadRemainingVideos = async () => {
      const remainingVideos = videos.slice(initialVideosCount);
      for (const videoUrl of remainingVideos) {
        if (!mounted) break;
        try {
          await loadVideo(videoUrl);
          if (mounted) {
            // Add small delay between loading videos for smoother appearance
            await new Promise(resolve => setTimeout(resolve, 200));
            setLoadedVideos(prev => [...prev, videoUrl]);
          }
        } catch (error) {
          console.error('Error loading video:', videoUrl, error);
        }
      }
    };

    loadInitialVideos().then(() => {
      // Start loading remaining videos only after initial ones are loaded
      loadRemainingVideos();
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!isInitialLoaded) {
    return <HeroSkeleton />;
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-between overflow-hidden px-4 md:px-6">
      {/* Hero Title Section */}
      <div className="max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center py-12 ">
        <h1 className="text-4xl sm:text-5xl md:text-5xl  mt-12 font-semibold tracking-tight leading-tight">
          <span className="block mb-2">Create AI-Generated</span>
          <span className="block">
            <span>Realistic </span>
            <span className="italic">Human Content</span>
          </span>
        </h1>
        
        <h2 className="text-2xl sm:text-4xl md:text-4xl font-light text-gray-400 mt-4  leading-tight">
          <span className="block">Personalized. High Quality. Simple.</span>
        </h2>
        
        <div className="mt-8 md:mt-10">
          <div className="text-sm  mb-3">Free generation credits available</div>
          <RainbowButton 
            onClick={() => window.location.href="/login?state=signup"}
            className="flex items-center justify-center gap-2 mx-auto w-full sm:w-64"
          >
            <span className="text-xl">🎬</span>
            <span>Gain followers easy! </span>
          </RainbowButton>
          
          {/* Social Media Icons */}
          <div className="flex justify-center items-center gap-3 mt-6">
            <span className=" mr-1">Perfect for content on  </span>
            <a href="#" className="hover:scale-110 transition-transform">
              <img src="/social/tiktok.avif" alt="TikTok" width="32" height="32" className="rounded-lg" />
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              <img src="/social/instagram.avif" alt="Instagram" width="32" height="32" />
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              <img src="/social/youtube.avif" alt="YouTube" width="32" height="32" />
            </a>
          </div>
        </div>
      </div>

      {/* Video Carousel */}
      <div className="relative mt-auto -mx-4">
        <VideoCarousel videoUrls={loadedVideos} />
      </div>
    </div>
  );
};

export default HeroSection;
