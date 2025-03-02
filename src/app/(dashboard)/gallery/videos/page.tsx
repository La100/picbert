import React from "react";
import { MediaGallery } from "@/components/gallery/MediaGallery";
import { getVideos } from "@/app/actions/video-actions";
import { Metadata } from "next";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const metadata: Metadata = {
  title: "Videos Gallery | Faces Factory",
  description: "Videos Gallery for Faces Factory",
};

const GalleryLoading = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <LoadingSpinner size="lg" />
  </div>
);

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function VideosGalleryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = 12;

  const videos = await getVideos(currentPage, pageSize);
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
        <MediaGallery 
          items={videosWithType}
          currentPage={currentPage}
          totalCount={videos.count || 0}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
} 