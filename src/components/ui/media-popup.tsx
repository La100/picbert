"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./button";
import { Badge } from "./badge";
import { Download, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface MediaPopupProps {
  url: string;
  onClose: () => void;
  showDelete?: boolean;
  onDelete?: () => Promise<void>;
  metadata?: {
    label: string;
    value: string;
  }[];
  type: 'image' | 'video';
}

export function MediaPopup({
  url,
  onClose,
  showDelete = false,
  onDelete,
  metadata,
  type
}: MediaPopupProps) {
  const handleDownload = async () => {
    try {
      if (!url) return;

      if (navigator.share && /mobile|android|ios/i.test(navigator.userAgent)) {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], `file.${type === 'video' ? 'mp4' : 'png'}`, { 
          type: type === 'video' ? 'video/mp4' : 'image/png' 
        });
        
        await navigator.share({
          files: [file],
          title: 'Download Media',
        });
      } else {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `file.${type === 'video' ? 'mp4' : 'png'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        toast.success("Download started");
      }
    } catch (error) {
      console.error("Failed to download:", error);
      toast.error("Failed to download");
    }
  };

  const promptMetadata = metadata?.find(
    item => item.label.toLowerCase() === 'prompt'
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-[90%] sm:w-[85%] sm:max-w-2xl mx-auto my-4 p-4 sm:p-6 [&>button]:hidden max-h-[95vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          {type === 'video' ? 'Video Preview' : 'Image Preview'}
        </DialogTitle>
        <div className="pb-4">
          <div className="flex justify-between items-center gap-2 sm:gap-4 mb-4">
            <div className="flex gap-2 sm:gap-4">
              <Button
                size="icon"
                variant="default"
                onClick={handleDownload}
                className="h-9 w-12 sm:w-14"
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
              {showDelete && onDelete && (
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={onDelete}
                  className="h-9 w-12 sm:w-14"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="h-9 w-12 sm:w-14"
            >
              <X className="h-8 w-8" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="relative w-full flex justify-center items-center">
            {type === 'video' ? (
              <div className="w-full max-h-[65vh] sm:max-h-[70vh] flex justify-center items-center">
                <video
                  src={url}
                  controls
                  autoPlay
                  loop
                  muted
                  className="max-w-full h-auto max-h-[65vh] sm:max-h-[70vh] rounded-lg shadow-lg mb-4 object-contain"
                />
              </div>
            ) : (
              <img
                src={url}
                alt="Preview"
                className="max-w-full h-auto max-h-[50vh] sm:max-h-[50vh] rounded-lg shadow-lg mb-4 object-contain"
              />
            )}
          </div>

          {promptMetadata && (
            <>
              <hr className="border-primary/30 mb-4" />
              <div className="flex flex-col gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full border border-primary/30 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-normal"
                >
                  <span className="font-semibold uppercase mr-2">Prompt:</span>
                  {promptMetadata.value}
                </Badge>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 