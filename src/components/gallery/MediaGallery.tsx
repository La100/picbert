"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { VideoDialog } from "./VideoDialog";
import { ClientVideoDialog } from "./ClientVideoDialog";
import { AdDialog } from "./AdDialog";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { uploadClientVideo } from '@/app/actions/client-video-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Tables } from "@database.types";

type BaseMediaItem = {
  id: string;
  url: string;
  created_at: string;
};

type VideoItem = BaseMediaItem & Tables<"generated_videos"> & {
  type: 'video';
};

type ClientVideoItem = BaseMediaItem & {
  type: 'client-video';
  original_name: string;
  video_name: string;
};

type AdItem = BaseMediaItem & {
  type: 'ad';
  ugc_video_url: string;
  client_video_url: string;
  mergedVideoUrl: string;
  ugc_text: string;
  client_text: string;
  ugc_text_position: 'top' | 'middle' | 'bottom';
  client_text_position: 'top' | 'middle' | 'bottom';
};

type MediaItem = VideoItem | ClientVideoItem | AdItem;

interface MediaGalleryProps {
  items: MediaItem[];
  type: 'video' | 'client-video' | 'ad';
  showUpload?: boolean;
}

export function MediaGallery({ items, type, showUpload = false }: MediaGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('Video file is too large. Maximum size is 10MB.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadClientVideo(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Video uploaded successfully');
        router.refresh();
      }
    } catch (error) {
      toast.error('Upload failed');
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [router]);

  const handleItemClick = useCallback((item: MediaItem) => {
    setSelectedItem(item);
  }, []);

  const memoizedGalleryContent = useMemo(() => {
    if (items.length === 0) {
      return (
        <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
          No items found
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
        {items.map((item) => (
          <div key={item.id}>
            <div
              className="relative group cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <div className="absolute inset-0 bg-black/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded z-10">
                <div className="flex items-center justify-center h-full">
                  <p className="text-white text-lg font-semibold">View Details</p>
                </div>
              </div>
              <video
                src={item.type === 'ad' ? item.mergedVideoUrl : item.url}
                className={`w-full rounded object-cover ${
                  type === 'ad' ? 'aspect-[9/16]' :
                  item.type === 'video' ? (
                    item.aspect_ratio === "16:9" ? "aspect-video" :
                    item.aspect_ratio === "9:16" ? "aspect-[9/16]" :
                    "aspect-square"
                  ) : 'aspect-[9/16]'
                }`}
                poster={item.type === 'ad' ? item.mergedVideoUrl : item.url + '#t=0.001'}
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={(e) => {
                  // Set the current time to 0 to ensure we show the first frame
                  e.currentTarget.currentTime = 0;
                }}
                onError={(e) => {
                  // If video fails to load, we can add a fallback background
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }, [items, handleItemClick, type]);

  const memoizedUploadButton = useMemo(() => showUpload && (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">
        {type === 'video' ? 'Videos' : type === 'client-video' ? 'Product Videos' : 'Ads'}
      </h2>
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        size="sm"
        disabled={isUploading}
      >
        {isUploading ? (
          "Uploading..."
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Upload Video
          </>
        )}
      </Button>
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="video/*"
        onChange={handleUpload}
      />
    </div>
  ), [isUploading, type, showUpload]);

  const renderDialog = () => {
    if (!selectedItem) return null;

    switch (selectedItem.type) {
      case 'video':
        return (
          <VideoDialog
            video={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        );
      case 'client-video':
        return (
          <ClientVideoDialog
            video={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        );
      case 'ad':
        return (
          <AdDialog
            ad={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {memoizedUploadButton}
      {memoizedGalleryContent}
      {renderDialog()}
    </div>
  );
} 