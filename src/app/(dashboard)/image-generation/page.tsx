import { ImageConfigurationsSkeleton } from "@/components/image-generation/ImageConfigurationsSkeleton";
import { Metadata } from 'next'
import { Suspense } from 'react'
import ImageGenerationClientWrapper from "@/components/image-generation/ImageGenerationClientWrapper";

export const maxDuration = 30;

export const metadata: Metadata = {
  title: "Image Generation | Faces Factory",
  description: "Image generation for Faces Factory",
}

export default function ImageGenerationPage() {
  return (
    <section className="container mx-auto flex flex-col gap-8">
      <Suspense fallback={<ImageConfigurationsSkeleton />}>
        <ImageGenerationClientWrapper />
      </Suspense>
    </section>
  );
}
