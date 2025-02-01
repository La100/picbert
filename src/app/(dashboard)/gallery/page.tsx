import React from "react";
import { Gallery } from "@/components/gallery/Gallery";
import { VideoGallery } from "@/components/gallery/VideoGallery";
import { getImages } from "@/app/actions/image-actions";
import { getVideos } from "@/app/actions/video-actions";
import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const maxDuration = 30;

export const metadata: Metadata = {
  title: "Gallery | Pictoria AI",
  description: "Gallery for Pictoria AI",
};

export default async function GalleryPage() {
  const { data: images } = await getImages();
  const { data: videos } = await getVideos();

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-semibold mb-2">My Gallery</h1>
      <p className="text-muted-foreground mb-6">
        Here you can see all your generated content. Click on an item to view details.
      </p>

      <Tabs defaultValue="images" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="images">
          <Gallery images={images || []} />
        </TabsContent>
        
        <TabsContent value="videos">
          <VideoGallery videos={videos || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
