
import Configurations from "@/components/image-generation/Configurations";
import GeneratedImages from "@/components/image-generation/GeneratedImages";
import { Metadata } from 'next'

export const maxDuration = 30;

export const metadata: Metadata = {
  title: "Image Generation | Pictoria AI",
  description: "Image generation for Pictoria AI",
}



export default  function ImageGenerationPage () {

  return (
    <section className="container mx-auto grid flex-1 gap-4 overflow-auto grid-cols-1 lg:grid-cols-3">
      <Configurations  />
      <div className="relative flex h-fit flex-col items-center justify-center rounded-xl p-0 lg:p-4 lg:col-span-2">
        <GeneratedImages />
        <div className="flex-1" />
      </div>
    </section>
  );
}
