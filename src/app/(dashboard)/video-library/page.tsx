import { Metadata } from "next";
import { Suspense } from "react";
import { VideoLibraryContent } from "@/components/video-library/VideoLibraryContent";
import { GallerySkeleton } from "@/components/gallery/GallerySkeleton";
import { createClient } from "@/lib/supabase/server";
import { listVideos } from "@/lib/cloudflare/r2";
import { LockedContent } from "@/components/ui/locked-content";
import { promptStarters } from "@/data/prompt-starters";

export const metadata: Metadata = {
  title: "Video Library | Faces Factory",
  description: "Video Library for clients",
};

async function VideoLibraryData() {
  // Create Supabase client
  const supabase = await createClient();
  
  // Get user session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if user has an active subscription
  let hasActiveSubscription = false;
  
  if (session) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();
    
    hasActiveSubscription = !!subscription;
  }

  // Fetch videos from R2 bucket (only if user has subscription to avoid unnecessary API calls)
  const videos = hasActiveSubscription ? await listVideos() : [];

  // Extract image URLs from prompt starters, ensure we have at least 8 unique images
  let previewImages = promptStarters.map(starter => starter.previewImageUrl);
  
  // If we have less than 8 images, repeat some images to fill
  while (previewImages.length < 8) {
    previewImages = [...previewImages, ...previewImages].slice(0, 8);
  }

  return hasActiveSubscription ? (
    <VideoLibraryContent videos={videos} />
  ) : (
    <LockedContent 
      title="Unlock Our Premium AI Video Library"
      description="Subscribe now to access our exclusive collection of 200 AI-generated videos. Browse through a variety of AI-created faces with lifelike expressions and movements."
      previewImages={previewImages}
      className="mt-8"
    />
  );
}

export default function VideoLibraryPage() {
  return (
    <div className="container mx-auto">
      <Suspense fallback={<GallerySkeleton />}>
        <VideoLibraryData />
      </Suspense>
    </div>
  );
} 