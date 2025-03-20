import React from "react";
import { LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface LockedContentProps {
  title: string;
  description: string;
  className?: string;
  onSubscribeClick?: () => void;
  previewImages: string[];
}

export const LockedContent = ({
  title,
  description,
  className,
  onSubscribeClick,
  previewImages,
}: LockedContentProps) => {
  // Slice to get maximum 8 images
  const displayImages = previewImages.slice(0, 8);
  
  return (
    <div
      className={cn(
        "relative w-full max-w-5xl mx-auto rounded-lg overflow-hidden bg-slate-50 border border-slate-200 text-slate-900",
        className
      )}
    >
      {/* Image Gallery Grid with overlay */}
      <div className="relative w-full">
        {/* Central overlay content */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-lg border border-slate-200 text-center max-w-md mx-auto transform transition-transform hover:scale-105">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 mx-auto mb-3 sm:mb-4">
              <LockKeyhole className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
              {title}
            </h2>
            
            <p className="text-slate-600 mb-4 sm:mb-5 text-sm sm:text-base">
              {description}
            </p>
            
            {onSubscribeClick ? (
              <Button
                onClick={onSubscribeClick}
                className="bg-slate-900 hover:bg-slate-800 text-white text-sm sm:text-base font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-md flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade Now
              </Button>
            ) : (
              <Link href="/billing">
                <Button
                  className="mx-auto bg-slate-900 hover:bg-slate-800 text-white text-sm sm:text-base font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-md flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade Now
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Image grid - adjusted aspect ratios for mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {displayImages.map((src, index) => (
            <div
              key={`preview-image-${index}`}
              className={cn(
                "relative aspect-square sm:aspect-[9/16] w-full overflow-hidden animate-fadeIn",
                index > 0 && "opacity-0" // Only first image is visible immediately, others fade in
              )}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={src}
                  alt="AI Generated Face"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  priority={index < 2} // Only prioritize first two images
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 