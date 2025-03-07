import { create } from 'zustand'
import { toast } from 'sonner'
import { storeImages } from '@/app/actions/image-actions'
import { getCredits } from '@/app/actions/credit-actions'
import { IMAGE_TOKEN_COST } from '@/lib/constants'

interface StoreResult {
  results: Array<{
    fileName?: string;
    error: string | null;
    success: boolean;
    data: Array<{ id: string }> | null;
  }>;
}

interface GenerateState {
  loading: boolean
  images: Array<{ 
    url: string;
    width: number;
    height: number;
    id?: string;
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

      // Credits are already checked and deducted in the Configurations component
      // No need to check or deduct credits again here
      console.log("Processing generated image - tokens already deducted in frontend");

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

      // Add IDs to the images from the store result
      const storeData = storeResult.data as unknown as StoreResult;
      const imagesWithIds = imageUrls.map((img, index) => ({
        ...img,
        id: storeData.results[index]?.data?.[0]?.id
      }))
      
      // Update the state with new images
      set({ images: imagesWithIds, loading: false, error: null })
      toast.success("Image processed and saved to your gallery", { id: toastId })

    } catch (error) {
      console.error("Error in generateImage:", error)
      set({ error: 'Failed to process image. Please try again.', loading: false, images: [] })
      toast.error("Failed to process image. Please try again.")
    }
  },
}))

export default useGenerateStore
