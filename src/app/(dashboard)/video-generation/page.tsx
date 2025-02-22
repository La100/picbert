import VideoConfigurations from "@/components/video-generation/VideoConfigurations";
import GeneratedVideos from "@/components/video-generation/GeneratedVideos";
import { Metadata } from 'next'
import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton";

export const maxDuration = 30;

export const metadata: Metadata = {
  title: "Video Generation | Pictoria AI",
  description: "Video generation for Pictoria AI",
}

function VideoConfigurationsSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  );
}

export default function VideoGenerationPage() {
  return (
    <section className="container mx-auto flex flex-col gap-8 ">
      <Suspense fallback={<VideoConfigurationsSkeleton />}>
        <VideoConfigurations />
      </Suspense>
      <div className="w-full flex justify-center">
        <GeneratedVideos />
      </div>
    </section>
  );
} 