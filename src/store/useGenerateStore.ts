import { create } from 'zustand'
import { toast } from 'sonner'
import { checkAndUpdateCredits, storeImages } from '@/app/actions/image-actions'

interface GenerateState {
  loading: boolean
  images: Array<{ 
    url: string;
    width: number;
    height: number;
  } & GenerateFormValues>
  error: string | null
  setLoading: (loading: boolean) => void
  generateImage: (values: GenerateFormValues & { data: { images: Array<{ url: string; width: number; height: number }> } }) => Promise<void>
}

interface GenerateFormValues {
  prompt: string;
  aspect_ratio: string;
  raw: boolean;
}

const useGenerateStore = create<GenerateState>((set) => ({
  loading: false,
  images: [],
  error: null,
  setLoading: (loading: boolean) => set({ loading }),

  generateImage: async (values: GenerateFormValues & { data: { images: Array<{ url: string; width: number; height: number }> } }) => {
    try {
      set({ error: null, images: [] })
      const toastId = toast.loading('Processing generated image...')

      // Check credits before proceeding
      const creditCheck = await checkAndUpdateCredits();
      console.log("Credit check result:", creditCheck);
      
      if (!creditCheck.hasCredits) {
        toast.error(creditCheck.error || "No credits available", { id: toastId });
        set({ error: creditCheck.error || "No credits available", loading: false });
        return;
      }

      const imageUrls = values.data.images.map((img) => ({
        url: img.url,
        width: img.width,
        height: img.height,
        prompt: values.prompt,
        aspect_ratio: values.aspect_ratio,
        raw: values.raw,
      }))

      console.log("Storing images...");
      // Store the generated images
      const storeResult = await storeImages(imageUrls)
      console.log("Store result:", storeResult);
      
      if (!storeResult.success) {
        console.error("Failed to store images:", storeResult.error)
        toast.error("Failed to save image to your gallery. Please try again.", { id: toastId })
        set({ error: storeResult.error || 'Failed to store image', loading: false })
        return
      }
      
      // Update the state with new images
      set({ images: imageUrls, loading: false, error: null })
      toast.success("Image processed and saved to your gallery", { id: toastId })

    } catch (error) {
      console.error("Error in generateImage:", error)
      set({ error: 'Failed to process image. Please try again.', loading: false, images: [] })
      toast.error("Failed to process image. Please try again.")
    }
  },
}))

export default useGenerateStore
