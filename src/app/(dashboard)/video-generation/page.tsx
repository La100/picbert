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
    <section className="container mx-auto flex flex-col gap-8 p-4">
      <VideoConfigurations />
      <div className="w-full flex justify-center">
        <GeneratedVideos />
      </div>
    </section>
  );
} 