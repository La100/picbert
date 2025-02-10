"use client";

import { useEffect, useState, useRef } from "react";
import { getClientVideos, uploadClientVideo } from "@/app/actions/client-video-actions";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface ClientVideo {
  id: string;
  video_name: string;
  original_name: string;
  created_at: string;
  url: string;
}

interface ClientVideoSelectorProps {
  onSelect: (url: string) => void;
}

export default function ClientVideoSelector({ onSelect }: ClientVideoSelectorProps) {
  const [videos, setVideos] = useState<ClientVideo[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadVideos = async () => {
    try {
      const response = await getClientVideos();
      if (response.success && response.data) {
        setVideos(response.data);
      }
    } catch (error) {
      console.error("Failed to load client videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadClientVideo(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Video uploaded successfully');
        // Reload videos after successful upload
        await loadVideos();
      }
    } catch (error) {
      toast.error('Upload failed');
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
    onSelect(url);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading videos...</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-muted-foreground">No client videos available.</p>
        <div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload Video"}
          </Button>
          <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="video/*"
            onChange={handleUpload}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 rounded-lg border bg-background max-h-[560px] overflow-y-auto">
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? "Uploading..." : "Upload Video"}
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="video/*"
          onChange={handleUpload}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {videos.map((video) => (
          <Card
            key={video.id}
            className={cn(
              "relative aspect-[9/16] cursor-pointer overflow-hidden group hover:ring-2 hover:ring-primary transition-all",
              selectedUrl === video.url && "ring-2 ring-primary"
            )}
            onClick={() => handleSelect(video.url)}
          >
            {/* Video Preview */}
            <div className="absolute inset-0">
              <video
                src={video.url}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
                poster={`${video.url}#t=0.001`}
                onLoadedMetadata={(e) => {
                  e.currentTarget.currentTime = 0;
                }}
                onError={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
            </div>
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-sm truncate">{video.original_name}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 