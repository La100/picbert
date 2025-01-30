import { create } from 'zustand'
import { toast } from 'sonner'
import { storeImages } from '@/app/actions/image-actions'

interface GenerateState {
  loading: boolean
  images: Array<{ 
    url: string;
    width: number;
    height: number;
  } & GenerateFormValues>
  error: string | null
  setLoading: (loading: boolean) => void
  generateImage: (values: GenerateFormValues & { data: any }) => Promise<void>
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

  generateImage: async (values: GenerateFormValues & { data: any }) => {
    try {
      set({ error: null, images: [] })
      const toastId = toast.loading('Processing generated image...')

      const imageUrls = values.data.images.map((img: { url: string; width: number; height: number }) => ({
        url: img.url,
        width: img.width,
        height: img.height,
        prompt: values.prompt,
        aspect_ratio: values.aspect_ratio,
        raw: values.raw,
      }))

      // Store the generated images first
      await storeImages(imageUrls)
      
      // Then update the state with new images
      set({ images: imageUrls, loading: false, error: null })
      toast.success("Image processed successfully", { id: toastId })

    } catch (error) {
      console.error(error)
      set({ error: 'Failed to process image. Please try again.', loading: false, images: [] })
      toast.error("Failed to process image. Please try again.")
    }
  },
}))

export default useGenerateStore
