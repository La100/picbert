import Configurations from "@/components/image-generation/Configurations";
import GeneratedImages from "@/components/image-generation/GeneratedImages";
import { ImageConfigurationsSkeleton } from "@/components/image-generation/ImageConfigurationsSkeleton";
import { Metadata } from 'next'
import { Suspense } from 'react'

export const maxDuration = 30;

export const metadata: Metadata = {
  title: "Image Generation | Faces Factory",
  description: "Image generation for Faces Factory",
}

export default function ImageGenerationPage() {
  return (
    <section className="container mx-auto flex flex-col gap-8">
      <Suspense fallback={<ImageConfigurationsSkeleton />}>
        <Configurations />
      </Suspense>
      <div className="w-full flex justify-center">
        <GeneratedImages />
      </div>
    </section>
  );
}
