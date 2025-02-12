import React from "react";
import { MediaGallery } from "@/components/gallery/MediaGallery";
import { getVideos } from "@/app/actions/video-actions";
import { Metadata } from "next";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const metadata: Metadata = {
  title: "Videos Gallery | Pictoria AI",
  description: "Videos Gallery for Pictoria AI",
};

const GalleryLoading = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <LoadingSpinner size="lg" />
  </div>
);

export default async function VideosGalleryPage() {
  const videos = await getVideos();
  const videosWithType = videos.data?.map(video => ({ ...video, type: 'video' as const })) || [];

  return (
    <div className="container mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold mb-2">My Videos</h1>
        <p className="text-muted-foreground">
          Here you can see all your generated videos. Click on an item to view details.
        </p>
      </header>

      <Suspense fallback={<GalleryLoading />}>
        <MediaGallery items={videosWithType} />
      </Suspense>
    </div>
  );
} 