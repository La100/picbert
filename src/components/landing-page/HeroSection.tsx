"use client";
import React from "react";
import { motion } from "framer-motion";

const videos = [
  "https://api.facesfactory.com/storage/v1/object/public/images//1.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//3.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//4.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//5.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//2.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//6.mp4",
  "https://api.facesfactory.com/storage/v1/object/public/images//7.mp4"
];

const HeroSection = () => {
  // Oblicz całkowitą szerokość przesunięcia
  const slideWidth = (280 + 16) * videos.length; // szerokość video + gap

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Title Section */}
      <div className="max-w-5xl mx-auto text-center py-10">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="block">Find And Outreach</span>
          <span className="block">
            <span>1000s Of </span>
            <span className="text-orange-500">Viral Creators</span>
          </span>
        </h1>
        
        <h2 className="text-4xl md:text-6xl font-light text-gray-400 mt-2">
          <span className="block">For Your Startup. On Autopilot</span>
        </h2>
        
        <div className="mt-8 flex justify-center items-center gap-2">
          <span className="text-lg md:text-xl">The first</span>
          <span className="border border-gray-800 rounded-full px-3 py-1 text-lg md:text-xl">AI Agents</span>
          <span className="text-lg md:text-xl">to automate creator marketing</span>
        </div>
        
        <div className="mt-10">
          <div className="text-sm text-gray-500 mb-2">89/100 spots left</div>
          <a 
            href="#" 
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-10 py-3 rounded-md flex items-center justify-center gap-2 mx-auto w-64"
          >
            <span className="text-xl">🔍</span>
            <span>Find Creators</span>
          </a>
        </div>
      </div>

      {/* Video Carousel - NAJPROSTSZE ROZWIĄZANIE */}
      <div className="relative mt-16 pt-16">
        <motion.div 
          className="flex gap-4"
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
          {/* Potrójne powielenie dla płynności */}
          {[...videos, ...videos, ...videos].map((video, index) => (
            <div key={index} className="flex-shrink-0 w-[280px]">
              <video
                src={video}
                autoPlay
                loop
                muted
                playsInline
                className="w-full aspect-[9/16] rounded-lg object-cover"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
