"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@database.types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface RecentImagesProps {
  images: Array<
    Tables<"generated_images"> & {
      url: string | undefined;
    }
  >;
}

export function RecentImages({ images }: RecentImagesProps) {
  if (images.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Image Generations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No images generated yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Recent Image Generations</CardTitle>
        <Button asChild variant="ghost" size="sm" className="-mr-2">
          <Link href="/gallery/images">
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
            {images.map((image) => (
              <CarouselItem
                key={image.id}
                className="pl-2 md:pl-4 basis-1/2 md:basis-1/3"
              >
                <div className="space-y-1">
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-lg",
                      image.height && image.width
                        ? Number(image.width / image.height) === 1
                          ? "aspect-square"
                          : `aspect-[${image.width}/${image.height}]`
                        : "aspect-square"
                    )}
                  >
                    <img
                      src={image.url || ""}
                      alt={image.prompt || "Generated image"}
                      width={image.width || 100}
                      height={image.height || 100}
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {image.prompt}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 h-8 w-8" />
          <CarouselNext className="-right-3 h-8 w-8" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
