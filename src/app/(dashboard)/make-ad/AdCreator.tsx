"use client";

import AdCreationForm from "@/components/ad-creation/AdCreationForm"
import { useState } from "react";

interface PreviewData {
  videoId: string;
  text: string;
  textPosition: 'top' | 'middle' | 'bottom';
}

export default function AdCreator() {
  const [preview, setPreview] = useState<PreviewData>({
    videoId: "",
    text: "",
    textPosition: 'bottom'
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
          <div className="relative w-[280px] h-[560px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
            {/* Screen Content */}
            <div className="relative w-full h-full bg-background rounded-[2.2rem] overflow-hidden">
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

                {/* Text Overlay */}
                {preview.text && (
                  <div 
                    className={`absolute inset-x-0 p-6 ${
                      preview.textPosition === 'top' ? 'top-0' :
                      preview.textPosition === 'middle' ? 'top-1/2 -translate-y-1/2' :
                      'bottom-0'
                    }`}
                  >
                    <p className="text-white text-center text-lg font-medium [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.9),_0_0_4px_rgb(0_0_0_/_0.4)]">
                      {preview.text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 