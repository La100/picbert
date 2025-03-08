"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Tables } from "@database.types";
import { useState } from "react";
import Image from "next/image";
import { MediaPopup } from "@/components/ui/media-popup";

interface RecentVideosProps {
  videos: Array<
    Tables<"generated_videos"> & {
      url: string | undefined | null;
      input_image: string | null;
    }
  >;
}

export function RecentVideos({ videos }: RecentVideosProps) {
  const [selectedVideo, setSelectedVideo] = useState<(Tables<"generated_videos"> & {
    url: string | undefined | null;
    input_image: string | null;
  }) | null>(null);

  if (videos.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Video Generations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No videos generated yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Recent Video Generations</CardTitle>
        <Button asChild variant="ghost" size="sm" className="-mr-2">
          <Link href="/gallery/videos">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {videos.map((video) => (
              <CarouselItem
                key={video.id}
                className="pl-2 md:pl-4 basis-1/2 md:basis-1/3"
              >
                <div className="space-y-1">
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-lg bg-muted cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]",
                      video.aspect_ratio === "1:1"
                        ? "aspect-square"
                        : `aspect-[${video.aspect_ratio.replace(":", "/")}]`
                    )}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <Image
                      src={video.input_image}
                      alt={video.prompt || "Video thumbnail"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.prompt}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 h-8 w-8" />
          <CarouselNext className="-right-3 h-8 w-8" />
        </Carousel>
      </CardContent>

      {selectedVideo && (
        <MediaPopup
          url={selectedVideo.url || ""}
          onClose={() => setSelectedVideo(null)}
          type="video"
          metadata={[
            {
              label: "Prompt",
              value: selectedVideo.prompt || "",
            }
          ]}
        />
      )}
    </Card>
  );
} 