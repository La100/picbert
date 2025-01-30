"use client";
import React from "react";
import useGenerateStore from "@/store/useGenerateStore";
import Image from "next/image";
import { Card, CardContent } from "../ui/card";

const GeneratedImages = () => {
  const images = useGenerateStore((state) => state.images);
  const loading = useGenerateStore((state) => state.loading);

  if (images.length === 0) return (
    <Card className="w-full max-w-2xl bg-muted">
      <CardContent className="flex aspect-square items-center justify-center p-6">
        <span className="text-2xl">
          {loading ? "Loading..." : "There are no images generated"}
        </span>
      </CardContent>
    </Card>
  );

  const image = images[0];

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-1">
        <div
          className="relative flex items-center justify-center rounded-lg overflow-hidden"
          style={{ 
            aspectRatio: `${image.width}/${image.height}`,
            maxHeight: '80vh'
          }}
        >
          <Image
            src={image.url}
            alt={`Generated image`}
            width={image.width}
            height={image.height}
            className="object-contain"
            priority
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedImages;
