import React from "react";
import { Gallery } from "@/components/gallery/Gallery";
import { getImages } from "@/app/actions/image-actions";
import { Metadata } from "next";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const metadata: Metadata = {
  title: "Images Gallery | Faces Factory",
  description: "Images Gallery for Faces Factory",
};

const GalleryLoading = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <LoadingSpinner size="lg" />
  </div>
);

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ImagesGalleryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = 12;

  const images = await getImages(currentPage, pageSize);

  return (
    <div className="container mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold mb-2">My Images</h1>
        <p className="text-muted-foreground">
          Here you can see all your generated images. Click on an item to view details.
        </p>
      </header>

      <Suspense fallback={<GalleryLoading />}>
        <Gallery 
          images={images.data || []} 
          currentPage={currentPage}
          totalCount={images.count || 0}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
} 