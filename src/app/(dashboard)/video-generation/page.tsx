import VideoConfigurations from "@/components/video-generation/VideoConfigurations";
import { Metadata } from 'next'
import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton";

export const maxDuration = 30;

export const metadata: Metadata = {
  title: 'Video Generation - Faces Factory',
  description: 'Generate videos from your images.',
}

function VideoConfigurationsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="w-full max-w-2xl mx-auto">
        <Skeleton className="h-[600px] w-full" />
      </div>
    </div>
  );
}

export default function VideoGenerationPage() {
  return (
    <section className="container mx-auto flex flex-col gap-8">
      <Suspense fallback={<VideoConfigurationsSkeleton />}>
        <VideoConfigurations />
      </Suspense>
    </section>
  );
} 