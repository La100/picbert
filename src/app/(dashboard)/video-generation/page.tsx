import VideoConfigurations from "@/components/video-generation/VideoConfigurations";
import GeneratedVideos from "@/components/video-generation/GeneratedVideos";
import { Metadata } from 'next'

export const maxDuration = 30;

export const metadata: Metadata = {
  title: "Video Generation | Pictoria AI",
  description: "Video generation for Pictoria AI",
}

export default function VideoGenerationPage() {
  return (
    <section className="container mx-auto grid flex-1 gap-4 overflow-auto grid-cols-1 lg:grid-cols-3">
      <VideoConfigurations />
      <div className="relative flex h-fit flex-col items-center justify-center rounded-xl p-0 lg:p-4 lg:col-span-2">
        <GeneratedVideos />
        <div className="flex-1" />
      </div>
    </section>
  );
} 