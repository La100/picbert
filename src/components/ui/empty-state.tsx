import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ImageIcon, VideoIcon } from "lucide-react";

interface EmptyStateProps {
  type: "image" | "video";
}

export function EmptyState({ type }: EmptyStateProps) {
  const router = useRouter();
  const Icon = type === "image" ? ImageIcon : VideoIcon;
  const title = type === "image" ? "No Images Yet" : "No Videos Yet";
  const description = type === "image" 
    ? "You haven't generated any images yet. Start creating amazing images!"
    : "You haven't generated any videos yet. Start creating amazing videos!";
  const buttonText = type === "image" ? "Generate Images" : "Generate Videos";
  const redirectPath = type === "image" ? "/image-generation" : "/video-generation";

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <Button 
        size="lg" 
        onClick={() => router.push(redirectPath)}
      >
        {buttonText}
      </Button>
    </div>
  );
} 