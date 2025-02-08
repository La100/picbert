"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteAd } from "@/app/actions/ad-actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdProps {
  id: string;
  ugc_video_url: string;
  client_video_url: string;
  ugc_text: string;
  client_text: string;
  ugc_text_position: 'top' | 'middle' | 'bottom';
  client_text_position: 'top' | 'middle' | 'bottom';
  created_at: string;
  mergedVideoUrl: string;
}

interface AdDialogProps {
  ad: AdProps;
  onClose: () => void;
}

export function AdDialog({ ad, onClose }: AdDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteAd(ad.id);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success("Ad deleted successfully");
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Failed to delete ad:", error);
      toast.error("Failed to delete ad");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            <span>Ad Details</span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <video
              src={ad.mergedVideoUrl}
              controls
              autoPlay
              loop
              muted
              className="w-full h-full object-contain"
            />
          </div>
          <div className="grid gap-2">
            <div>
              <h3 className="font-semibold">Created At</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(ad.created_at).toLocaleString()}
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
                Delete Ad
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 