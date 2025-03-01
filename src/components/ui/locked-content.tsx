import React from "react";
import { LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LockedContentProps {
  title: string;
  description: string;
  className?: string;
  onSubscribeClick?: () => void;
}

export const LockedContent = ({
  title,
  description,
  className,
  onSubscribeClick,
}: LockedContentProps) => {
  return (
    <div
      className={cn(
        "relative w-full max-w-3xl mx-auto rounded-lg overflow-hidden bg-slate-50 p-6 shadow-sm border border-slate-200 text-slate-900",
        className
      )}
    >
      <div className="relative flex flex-col items-center justify-center text-center space-y-5 py-8">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
          <LockKeyhole className="w-7 h-7 text-slate-500" />
        </div>
        
        <h2 className="text-xl font-medium mt-2">
          {title}
        </h2>
        
        <p className="text-slate-600 max-w-md text-sm">
          {description}
        </p>
        
        <div className="mt-2">
          {onSubscribeClick ? (
            <Button
              onClick={onSubscribeClick}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2 rounded-md flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade Now
            </Button>
          ) : (
            <Link href="/billing">
              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2 rounded-md flex items-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}; 