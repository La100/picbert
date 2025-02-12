"use client";
import React from "react";
import useGenerateStore from "@/store/useGenerateStore";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Download } from "lucide-react";

interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  output_format?: string;
}

const GeneratedImages = () => {
  const images = useGenerateStore((state) => state.images);
  const loading = useGenerateStore((state) => state.loading);

  const handleDownload = (image: GeneratedImage) => {
    const fileExtension = image?.output_format?.toLowerCase() || 'png';
    fetch(image.url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `generated-image-${Date.now()}.${fileExtension}`
        );

        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error downloading the image:", error));
  };

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
        <div className="relative flex items-center justify-center rounded-lg overflow-hidden">
          <img
            src={image.url}
            alt={`Generated image`}
            width={image.width}
            height={image.height}
            className="object-contain"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              variant="default"
              className="w-fit"
              onClick={() => handleDownload(image)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedImages;
