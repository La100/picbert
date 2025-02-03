"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { uploadClientVideo } from '@/app/actions/client-video-actions';
import { toast } from 'sonner';
import { ClientVideoDialog } from './ClientVideoDialog';
import { useRouter } from 'next/navigation';

interface ClientVideo {
  id: string;
  video_name: string;
  original_name: string;
  created_at: string;
  url: string;
}

interface ClientVideoGalleryProps {
  videos: ClientVideo[];
}

export function ClientVideoGallery({ videos }: ClientVideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = React.useState<ClientVideo | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

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
        router.refresh();
      }
    } catch (error) {
      toast.error('Upload failed');
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Client Videos</h2>
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {videos.map((video) => (
          <div
            key={video.id}
            className="relative group cursor-pointer rounded-lg overflow-hidden max-w-[240px] mx-auto"
            onClick={() => setSelectedVideo(video)}
          >
            <video
              className="w-full aspect-[9/16] object-cover"
              src={video.url}
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-2 left-2 text-white">
                <p className="font-medium">{video.original_name}</p>
                <p className="text-sm opacity-75">
                  {new Date(video.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <ClientVideoDialog
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
} 