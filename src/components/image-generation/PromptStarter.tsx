import { promptStarters } from "@/data/prompt-starters";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PromptStarterProps {
  onSelect: (prompt: string) => void;
}

export function PromptStarterSelector({ onSelect }: PromptStarterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Check if we can scroll left
    setShowLeftArrow(container.scrollLeft > 0);
    
    // Check if we can scroll right
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 2
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full">
      {showLeftArrow && (
        <button 
          type="button"
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-1 shadow-md hover:bg-white transition-all"
          aria-label="Scroll left"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      
      <div className="mx-auto w-[320px] sm:w-[540px] overflow-hidden">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide scroll-smooth snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {promptStarters.map((starter) => (
            <button
              type="button"
              key={starter.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(starter.prompt);
              }}
              className="relative group overflow-hidden rounded-lg hover:ring-1 hover:ring-primary transition-all w-[100px] h-[179px] flex-shrink-0 snap-start"
            >
              <div className="relative w-full h-full">
                <Image
                  src={starter.previewImageUrl}
                  alt={starter.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium px-1 text-center">
                    {starter.name}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {showRightArrow && (
        <button 
          type="button"
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-1 shadow-md hover:bg-white transition-all"
          aria-label="Scroll right"
          style={{ transform: "translate(50%, -50%)" }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
} 