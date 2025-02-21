import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@database.types";
import { ImageIcon, ZapIcon, VideoIcon } from "lucide-react";

type Credits = Database["public"]["Tables"]["credits"]["Row"];

interface StatsCardsProps {
  imageCount: number;
  videoCount: number;
  credits: Credits | null;
}

export function StatsCards({
  imageCount,
  videoCount,
  credits,
}: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Total Images</CardTitle>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{imageCount}</div>
          <p className="text-sm text-muted-foreground">
            Images generated so far
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Total Videos</CardTitle>
          <VideoIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{videoCount}</div>
          <p className="text-sm text-muted-foreground">
            Videos generated so far
          </p>
        </CardContent>
      </Card>
    
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Image Credits</CardTitle>
          <ZapIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {credits?.image_generation_count || 0}/
            {credits?.max_image_generation_count || 0}
          </div>
          <p className="text-sm text-muted-foreground">
            Available generation credits
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Video Credits</CardTitle>
          <ZapIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {credits?.video_generation_count || 0}/
            {credits?.max_video_generation_count || 0}
          </div>
          <p className="text-sm text-muted-foreground">
            Available video credits
          </p>
        </CardContent>
      </Card>
     
    </div>
  );
}
