"use client";

import AdCreationForm from "@/components/ad-creation/AdCreationForm"
import { useState } from "react";

interface PreviewData {
  videoId: string;
  text: string;
}

export default function AdCreator() {
  const [preview, setPreview] = useState<PreviewData>({
    videoId: "",
    text: "",
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Make Ad</h1>
        <p className="text-muted-foreground mt-2">Create engaging advertisements with AI</p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Ad Creation Form */}
        <div>
          <AdCreationForm onPreview={setPreview} />
        </div>

        {/* Preview Section */}
        <div className="flex flex-col items-center justify-start p-6">
          <h2 className="text-2xl font-semibold mb-6 self-start">Live Preview</h2>
          
          {/* Phone Frame */}
          <div className="relative w-[280px] h-[560px] bg-black rounded-[3rem] p-3 shadow-2xl">
            {/* Screen Content */}
            <div className="relative w-full h-full bg-background rounded-[2.5rem] overflow-hidden">
              {/* Video Content */}
              <div className="absolute inset-0">
                {preview.videoId ? (
                  <video
                    key={preview.videoId}
                    src={preview.videoId}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Select a video to preview</p>
                  </div>
                )}

                {/* Story Progress Bar */}
                <div className="absolute inset-x-0 top-4 px-4 z-10">
                  <div className="w-full h-1 bg-white/30 rounded-full">
                    <div className="w-1/3 h-full bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Text Overlay */}
                {preview.text && (
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white text-center text-lg font-medium">{preview.text}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Phone Details */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 