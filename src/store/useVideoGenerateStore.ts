import { create } from "zustand";
import { toast } from "sonner";
import { checkAndUpdateVideoCredits, storeVideo } from "@/app/actions/video-actions";

interface Video {
  url: string;
  prompt: string;
  input_image: string;
  aspect_ratio: "16:9" | "9:16" | "1:1";
  duration: "5" | "10";
}

interface VideoGenerateData {
  data: {
    video: Video;
  };
}

interface VideoGenerateStore {
  videos: Video[];
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setVideo: (video: Video) => void;
  generateVideo: (data: VideoGenerateData) => Promise<void>;
}

const useVideoGenerateStore = create<VideoGenerateStore>((set) => ({
  videos: [],
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setVideo: (video) => set((state) => ({ 
    videos: [video, ...state.videos],
    loading: false 
  })),
  generateVideo: async (data) => {
    try {
      set({ error: null });
      const toastId = toast.loading('Processing generated video...');

      // Check credits before proceeding
      const creditCheck = await checkAndUpdateVideoCredits(data.data.video.duration);
      if (!creditCheck.hasCredits) {
        toast.error(creditCheck.error || `No video credits available for ${data.data.video.duration}-second video`, { id: toastId });
        set({ loading: false });
        return;
      }

      // Store the generated video
      const result = await storeVideo(data.data.video);
      if (result.error) {
        throw new Error(result.error);
      }

      // Update the state with the stored video URL
      set((state) => ({ 
        videos: [{
          ...data.data.video,
          url: result.data?.url as string || data.data.video.url
        }, ...state.videos],
        loading: false,
        error: null 
      }));
      
      toast.success("Video processed successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      set({ loading: false, error: error instanceof Error ? error.message : "Failed to process video" });
      toast.error("Failed to process video. Please try again.");
    }
  },
}));

export default useVideoGenerateStore; 