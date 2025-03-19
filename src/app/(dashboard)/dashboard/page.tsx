import { createClient } from "@/lib/supabase/server";
;
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentImages } from "@/components/dashboard/RecentImages";
import { RecentVideos } from "@/components/dashboard/RecentVideos";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { getCachedImages } from "@/app/actions/image-actions";
import { getCredits } from "@/app/actions/credit-actions";
import { getCachedVideos } from "@/app/actions/video-actions";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Faces Factory",
  description: "Dashboard for Faces Factory",
};

async function DashboardContent() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }

  const { data: credits } = await getCredits();
  const { data: images, count: imageCount } = await getCachedImages();
  const { data: videos, count: videoCount } = await getCachedVideos();

  return (
    <div className="container mx-auto flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold ">
          Welcome to Faces Factory
        </h2>
      </div>
      <div className="lg:col-span-2">
          <QuickActions />
        </div>
      <StatsCards
        imageCount={imageCount}
        videoCount={videoCount}
        credits={Array.isArray(credits) ? credits[0] : credits}
      />
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 text-lg">
        <RecentImages images={images?.slice(0, 6) ?? []} />
        <RecentVideos videos={videos?.slice(0, 4) ?? []} />
        
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
