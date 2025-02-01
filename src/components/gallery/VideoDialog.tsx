"use client";

import { Tables } from "@database.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteVideo } from "@/app/actions/video-actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type VideoProps = {
  url: string | undefined;
} & Tables<"generated_videos">;

interface VideoDialogProps {
  video: VideoProps;
  onClose: () => void;
}

export function VideoDialog({ video, onClose }: VideoDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteVideo(video.id.toString(), video.video_name);
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
            <span>Video Details</span>
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
              <h3 className="font-semibold">Prompt</h3>
              <p className="text-sm text-muted-foreground">{video.prompt}</p>
            </div>
           
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Aspect Ratio</h3>
                <p className="text-sm text-muted-foreground">
                  {video.aspect_ratio}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Duration</h3>
                <p className="text-sm text-muted-foreground">
                  {video.duration} seconds
                </p>
              </div>
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