import Configurations from "@/components/image-generation/Configurations";
import GeneratedImages from "@/components/image-generation/GeneratedImages";
import { Metadata } from 'next'


export const maxDuration = 30;

export const metadata: Metadata = {
  title: "Image Generation | Pictoria AI",
  description: "Image generation for Pictoria AI",
}

export default function ImageGenerationPage() {
  return (
    <section className="container mx-auto flex flex-col gap-8">
      <Configurations />
      <div className="w-full flex justify-center">
        <GeneratedImages />
      </div>
    </section>
  );
}
