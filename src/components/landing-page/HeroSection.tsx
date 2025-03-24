"use client";
import React from "react";
import { motion } from "framer-motion";

const videos = [
  "https://api.facesfactory.com/storage/v1/object/public/images//1.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//2.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//3.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//4.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//5.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//6.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//7.mp4"
];

const HeroSection = () => {
  // Duplicate videos array to create a seamless loop
  const allVideos = [...videos, ...videos];

  return (
    <div className="w-full overflow-hidden">
      <motion.div 
        className="flex gap-4 mt-16 pt-16"
        animate={{
          x: [0, -((280 + 16) * videos.length)], // Calculate exact width to move (video width + gap)
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop"
        }}
      >
        {allVideos.map((video, index) => (
          <div key={index} className="flex-shrink-0">
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="w-[280px] aspect-[9/16] rounded-lg object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default HeroSection;
