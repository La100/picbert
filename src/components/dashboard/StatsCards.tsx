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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-background to-muted/50 border border-primary/10 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Images</CardTitle>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{imageCount}</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-bl from-background to-muted/50 border border-primary/10 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
          <VideoIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{videoCount}</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-tr from-background to-muted/50 border border-primary/10 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Tokens</CardTitle>
          <ZapIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{credits?.tokens ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">1 image = 6 tokens</p>
          <p className="text-xs text-muted-foreground">1 video = 50 tokens</p>
        </CardContent>
      </Card>
    </div>
  );
}
