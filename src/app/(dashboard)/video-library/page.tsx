import { Metadata } from "next";
import { VideoLibraryContent } from "@/components/video-library/VideoLibraryContent";
import { videoLibraryData } from "@/data/video-library";

export const metadata: Metadata = {
  title: "Video Library | Pictoria AI",
  description: "Video Library for clients",
};

export default function VideoLibraryPage() {
  return (
    <div className="container mx-auto p-6">
      <VideoLibraryContent videos={videoLibraryData} />
    </div>
  );
} 