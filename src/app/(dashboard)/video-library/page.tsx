import { Metadata } from "next";
import { VideoLibraryContent } from "@/components/video-library/VideoLibraryContent";
import { videoLibraryData } from "@/data/video-library";
import { LockedContent } from "@/components/ui/locked-content";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Video Library | Pictoria AI",
  description: "Video Library for clients",
};

export default async function VideoLibraryPage() {
  // Check if user has subscription
  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  const isSubscribed = !!subscription;

  return (
    <div className="container mx-auto p-6">
      {isSubscribed ? (
        <VideoLibraryContent videos={videoLibraryData} />
      ) : (
        <div className="py-10">
          <LockedContent
            title="AI People Library"
            description="Access our exclusive collection of AI-generated people videos for your projects. Subscribe to unlock this feature and enhance your creative possibilities."
            onSubscribeClick={undefined}
          />
        </div>
      )}
    </div>
  );
} 