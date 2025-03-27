"use client";
import React, { useEffect } from "react";
import useGenerateStore from "@/store/useGenerateStore";
import Configurations from "./Configurations";
import GeneratedImages from "./GeneratedImages";

const ImageGenerationClientWrapper = () => {
  const clearImages = useGenerateStore((state) => state.clearImages);
  
  // Clear images when component mounts (page is loaded with refresh)
  useEffect(() => {
    // We'll use session storage to determine if this is a full page load
    // or just a navigation within the app
    const hasVisitedBefore = sessionStorage.getItem('visited_image_generation');
    
    // If this is a fresh session, clear images
    if (!hasVisitedBefore) {
      clearImages();
      sessionStorage.setItem('visited_image_generation', 'true');
    }
  }, [clearImages]);
  
  return (
    <>
      <Configurations />
      <div className="w-full flex justify-center">
        <GeneratedImages />
      </div>
    </>
  );
};

export default ImageGenerationClientWrapper; 