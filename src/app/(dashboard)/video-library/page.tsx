import { Metadata } from "next";
import { VideoLibraryContent } from "@/components/video-library/VideoLibraryContent";
import { getClientVideos, getAvailableTags } from "@/app/actions/client-video-actions";

export const metadata: Metadata = {
  title: "Video Library | Pictoria AI",
  description: "Video Library for clients",
};

export default async function VideoLibraryPage() {
  try {
    const [{ data: tags }, { data: initialVideos, count }] = await Promise.all([
      getAvailableTags(),
      getClientVideos()
    ]);

    if (!initialVideos || !tags) {
      return (
        <div className="container mx-auto p-6 text-center">
          <p className="text-red-500">Failed to load video library data. Please try again later.</p>
        </div>
      );
    }

    return (
      <div className="container mx-auto p-6">
        <VideoLibraryContent 
          initialVideos={initialVideos} 
          totalVideos={count} 
          availableTags={tags} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading video library:', error);
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-500">An unexpected error occurred. Please try again later.</p>
      </div>
    );
  }
} 