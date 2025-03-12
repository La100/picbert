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
  generateVideo: (data: VideoGenerateData) => Promise<void>;
}

const useVideoGenerateStore = create<VideoGenerateStore>((set) => ({
  videos: [],
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
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

      // Update the state by adding the new video to the beginning of the array
      set((state) => ({ 
        videos: [data.data.video, ...state.videos], 
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