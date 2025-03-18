import React from "react";
import { Gallery } from "@/components/gallery/Gallery";
import { getCachedImages } from "@/app/actions/image-actions";
import { Metadata } from "next";
import { Suspense } from "react";
import { GallerySkeleton } from "@/components/gallery/GallerySkeleton";

export const metadata: Metadata = {
  title: "Images Gallery | Faces Factory",
  description: "Images Gallery for Faces Factory",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

async function ImageGalleryContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = 12;

  const images = await getCachedImages(currentPage, pageSize);

  return (
    <div className="container mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold mb-2">My Images</h1>
        <p className="text-muted-foreground">
          Here you can see all your generated images. Click on an item to view details.
        </p>
      </header>

      <Gallery 
        images={images.data || []} 
        currentPage={currentPage}
        totalCount={images.count || 0}
        pageSize={pageSize}
      />
    </div>
  );
}

export default function ImagesGalleryPage(props: PageProps) {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <ImageGalleryContent {...props} />
    </Suspense>
  );
} 