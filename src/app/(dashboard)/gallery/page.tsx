import React from "react";
import { Gallery } from "@/components/gallery/Gallery";
import { MediaGallery } from "@/components/gallery/MediaGallery";
import { getImages } from "@/app/actions/image-actions";
import { getVideos } from "@/app/actions/video-actions";
import { getClientVideos } from "@/app/actions/client-video-actions";
import { getAds } from "@/app/actions/ad-actions";
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
  const { data: clientVideos } = await getClientVideos();
  const { data: ads } = await getAds();

  const videosWithType = videos?.map(video => ({ ...video, type: 'video' as const })) || [];
  const clientVideosWithType = clientVideos?.map(video => ({ ...video, type: 'client-video' as const })) || [];
  const adsWithType = ads?.map(ad => ({ ...ad, type: 'ad' as const })) || [];

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-semibold mb-2">My Gallery</h1>
      <p className="text-muted-foreground mb-6">
        Here you can see all your generated content. Click on an item to view details.
      </p>

      <Tabs defaultValue="images" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger asChild value="images">
            <a href="/gallery?tab=images">Images</a>
          </TabsTrigger>
          <TabsTrigger asChild value="videos">
            <a href="/gallery?tab=videos">Videos</a>
          </TabsTrigger>
          <TabsTrigger asChild value="client-videos">
            <a href="/gallery?tab=client-videos">Product Videos</a>
          </TabsTrigger>
          <TabsTrigger asChild value="ads">
            <a href="/gallery?tab=ads">Ads</a>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="images">
          <Gallery images={images || []} />
        </TabsContent>
        
        <TabsContent value="videos">
          <MediaGallery items={videosWithType} type="video" />
        </TabsContent>

        <TabsContent value="client-videos">
          <MediaGallery items={clientVideosWithType} type="client-video" showUpload />
        </TabsContent>

        <TabsContent value="ads">
          <MediaGallery items={adsWithType} type="ad" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
