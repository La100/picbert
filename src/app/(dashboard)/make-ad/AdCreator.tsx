"use client";

import AdCreationForm from "@/components/ad-creation/AdCreationForm"
import { useEffect, useRef, useState } from "react";

interface PreviewData {
  videoId: string;
  clientVideoId: string;
  ugcText: string;
  clientText: string;
  ugcTextPosition: 'top' | 'middle' | 'bottom';
  clientTextPosition: 'top' | 'middle' | 'bottom';
}

export default function AdCreator() {
  const [preview, setPreview] = useState<PreviewData>({
    videoId: "",
    clientVideoId: "",
    ugcText: "",
    clientText: "",
    ugcTextPosition: 'bottom',
    clientTextPosition: 'bottom'
  });

  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const [isShowingFirstVideo, setIsShowingFirstVideo] = useState(true);

  // Handle video sequence
  useEffect(() => {
    const firstVideo = firstVideoRef.current;
    const secondVideo = secondVideoRef.current;

    if (firstVideo && secondVideo) {
      // When first video ends, play second video if it exists
      firstVideo.onended = () => {
        if (preview.clientVideoId) {
          firstVideo.style.display = 'none';
          secondVideo.style.display = 'block';
          secondVideo.play();
          setIsShowingFirstVideo(false);
        } else {
          // If no second video, replay first video
          firstVideo.play();
        }
      };

      // When second video ends, go back to first video
      secondVideo.onended = () => {
        secondVideo.style.display = 'none';
        firstVideo.style.display = 'block';
        firstVideo.play();
        setIsShowingFirstVideo(true);
      };
    }
  }, [preview.videoId, preview.clientVideoId]);

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
                  <div className="relative w-full h-full">
                    {/* First Video (UGC) */}
                    <video
                      ref={firstVideoRef}
                      key={`ugc-${preview.videoId}`}
                      src={preview.videoId}
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                    {/* Second Video (Client) - Only render if exists */}
                    {preview.clientVideoId && (
                      <video
                        ref={secondVideoRef}
                        key={`client-${preview.clientVideoId}`}
                        src={preview.clientVideoId}
                        className="absolute inset-0 w-full h-full object-cover hidden"
                        muted
                        playsInline
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <path d="m7 4 10 8-10 8V4Z"/>
                      </svg>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">Wybierz wideo do podglądu</p>
                  </div>
                )}

                {/* Text Overlay */}
                {isShowingFirstVideo ? (
                  preview.ugcText && (
                    <div 
                      className={`absolute inset-x-0 p-6 ${
                        preview.ugcTextPosition === 'top' ? 'top-0' :
                        preview.ugcTextPosition === 'middle' ? 'top-1/2 -translate-y-1/2' :
                        'bottom-0'
                      }`}
                    >
                      <p className="text-white text-center text-lg font-medium [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.9),_0_0_4px_rgb(0_0_0_/_0.4)]">
                        {preview.ugcText}
                      </p>
                    </div>
                  )
                ) : (
                  preview.clientText && (
                    <div 
                      className={`absolute inset-x-0 p-6 ${
                        preview.clientTextPosition === 'top' ? 'top-0' :
                        preview.clientTextPosition === 'middle' ? 'top-1/2 -translate-y-1/2' :
                        'bottom-0'
                      }`}
                    >
                      <p className="text-white text-center text-lg font-medium [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.9),_0_0_4px_rgb(0_0_0_/_0.4)]">
                        {preview.clientText}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 