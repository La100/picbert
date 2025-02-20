"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  className?: string;
}

export const LoadingAnimation = ({ className }: LoadingAnimationProps) => {
  return (
    <div className={cn("w-full h-full flex items-center justify-center", className)}>
      <div 
        className="w-8 h-8 border-2 border-muted/30 border-t-foreground rounded-full animate-spin"
        style={{ animationDuration: '0.6s' }}
      />
    </div>
  );
}; 