"use client";

import { useState, useCallback, useMemo } from "react";

import { AdDialog } from "./AdDialog";

interface AdProps {
  id: string;
  ugc_video_url: string;
  client_video_url: string;
  mergedVideoUrl: string;
  ugc_text: string;
  client_text: string;
  ugc_text_position: 'top' | 'middle' | 'bottom';
  client_text_position: 'top' | 'middle' | 'bottom';
  created_at: string;
}

interface AdGalleryProps {
  ads: AdProps[];
}

export function AdGallery({ ads }: AdGalleryProps) {
  const [selectedAd, setSelectedAd] = useState<AdProps | null>(null);

  const handleAdClick = useCallback((ad: AdProps) => {
    setSelectedAd(ad);
  }, []);

  const memoizedGalleryContent = useMemo(() => {
    if (ads.length === 0) {
      return (
        <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
          No ads found
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
        {ads.map((ad) => (
          <div key={ad.id}>
            <div
              className="relative group cursor-pointer"
              onClick={() => handleAdClick(ad)}
            >
              <div className="absolute inset-0 bg-black/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded z-10">
                <div className="flex items-center justify-center h-full">
                  <p className="text-white text-lg font-semibold">View Details</p>
                </div>
              </div>
              <video
                src={ad.mergedVideoUrl}
                className="w-full aspect-[9/16] object-cover rounded"
                muted
                playsInline
                preload="metadata"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
              {/* Text Overlay */}
              <div 
                className={`absolute inset-x-0 p-6 ${
                  ad.ugc_text_position === 'top' ? 'top-0' :
                  ad.ugc_text_position === 'middle' ? 'top-1/2 -translate-y-1/2' :
                  'bottom-0'
                }`}
              >
                <p className="text-white text-center text-lg font-medium [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.9),_0_0_4px_rgb(0_0_0_/_0.4)]">
                  {ad.ugc_text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [ads, handleAdClick]);

  return (
    <div className="container mx-auto py-8">
      {memoizedGalleryContent}
      {selectedAd && (
        <AdDialog
          ad={selectedAd}
          onClose={() => setSelectedAd(null)}
        />
      )}
    </div>
  );
} 