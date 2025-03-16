import { Metadata } from "next";
import { VideoLibraryContent } from "@/components/video-library/VideoLibraryContent";
import { LockedContent } from "@/components/ui/locked-content";
import { createClient } from "@/lib/supabase/server";
import { listVideos } from "@/lib/cloudflare/r2";

export const metadata: Metadata = {
  title: "Video Library | Faces Factory",
  description: "Video Library for clients",
};

export default async function VideoLibraryPage() {
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

  return (
    <div className="container mx-auto">
      {hasActiveSubscription ? (
        <VideoLibraryContent videos={videos} />
      ) : (
        <LockedContent 
          title="Video Library" 
          description="Subscribe to access our exclusive video library content."
        />
      )}
    </div>
  );
} 