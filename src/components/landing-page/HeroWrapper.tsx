import { Suspense } from "react";
import HeroSection, { HeroSkeleton } from "./HeroSection";

// This is a server component that loads the hero section
async function HeroLoader() {
  return <HeroSection />;
}

export default function HeroWrapper() {
  return (
    <Suspense fallback={<HeroSkeleton />}>
      <HeroLoader />
    </Suspense>
  );
} 