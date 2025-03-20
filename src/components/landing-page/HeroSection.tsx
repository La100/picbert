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
  const allVideos = [...videos, ...videos, ...videos]; // Potrajamy dla płynności

  return (
    <div className="w-full overflow-hidden ">
      <motion.div 
        className="flex gap-4 mt-16 pt-16"
        animate={{
          x: [0, -1960], // Przesunięcie o szerokość jednego zestawu video
        }}
        transition={{
          duration: 20,
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
