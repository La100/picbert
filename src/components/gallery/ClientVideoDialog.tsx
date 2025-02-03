"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteClientVideo } from "@/app/actions/client-video-actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ClientVideoProps {
  id: string;
  video_name: string;
  original_name: string;
  created_at: string;
  url: string;
}

interface ClientVideoDialogProps {
  video: ClientVideoProps;
  onClose: () => void;
}

export function ClientVideoDialog({ video, onClose }: ClientVideoDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteClientVideo(video.id, video.video_name);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success("Video deleted successfully");
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Failed to delete video:", error);
      toast.error("Failed to delete video");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            <span>Client Video Details</span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <video
              src={video.url}
              controls
              autoPlay
              loop
              muted
              className="w-full h-full object-contain"
            />
          </div>
          <div className="grid gap-2">
            <div>
              <h3 className="font-semibold">Original Name</h3>
              <p className="text-sm text-muted-foreground">{video.original_name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Created At</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(video.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                variant="destructive"
                size="default"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Video
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 