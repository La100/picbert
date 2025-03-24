import { Suspense } from "react";
import HeroSection, { HeroSkeleton } from "./HeroSection";

// This is a server component that artificially delays loading
async function HeroLoader() {
  // Simulate network delay for demo purposes
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return <HeroSection />;
}

export default function HeroWrapper() {
  return (
    <Suspense fallback={<HeroSkeleton />}>
      <HeroLoader />
    </Suspense>
  );
} 