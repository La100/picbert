import { create } from 'zustand'
import { toast } from 'sonner'
import { storeImages } from '@/app/actions/image-actions'
import { createClient } from '@/lib/supabase/client'

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
    requestId?: string;
  } & GenerateFormValues>
  error: string | null
  setLoading: (loading: boolean) => void
  generateImage: (values: GenerateFormValues & { 
    data: { 
      images: Array<{ url: string; width: number; height: number }> 
    },
    requestId?: string
  }) => Promise<void>
  clearImages: () => void
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
  
  clearImages: () => set({ images: [] }),

  generateImage: async (values: GenerateFormValues & { 
    data: { images: Array<{ url: string; width: number; height: number }> },
    requestId?: string 
  }) => {
    try {
      // Instead of clearing the images array, we'll keep existing ones
      // and add the new one at the beginning
      set(() => ({ error: null, loading: true }))
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
        requestId: values.requestId // Add the requestId to each image
      }))

      console.log("Storing images...");
      // Store the generated images
      const storeResult = await storeImages(imageUrls)
      console.log("Store result:", storeResult);
      
      if (!storeResult.success) {
        console.error("Failed to store images:", storeResult.error)
        toast.error("Failed to save image to your gallery. Please try again.", { id: toastId })
        set(() => ({ error: storeResult.error || 'Failed to store image', loading: false }))
        return
      }

      // Add IDs to the images from the store result
      const storeData = storeResult.data as unknown as StoreResult;
      const imagesWithIds = await Promise.all(imageUrls.map(async (img, index) => {
        const storedImage = storeData.results[index];
        if (!storedImage?.data?.[0]?.id) return img;
        
        // Get the bucket URL from Supabase
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const { data: urlData } = supabase
          .storage
          .from("generated_images")
          .getPublicUrl(`${session?.user?.id}/${storedImage.fileName}`);

        return {
          ...img,
          url: urlData.publicUrl,
          id: storedImage.data[0].id,
          requestId: values.requestId // Save the request ID with the image
        };
      }));
      
      // Update the state with new images added to the beginning of the array
      set((state) => ({ 
        images: [...imagesWithIds, ...state.images], 
        loading: false, 
        error: null 
      }))
      toast.success("Image processed and saved to your gallery", { id: toastId })

    } catch (error) {
      console.error("Error in generateImage:", error)
      set(() => ({ 
        error: 'Failed to process image. Please try again.', 
        loading: false 
      }))
      toast.error("Failed to process image. Please try again.")
    }
  },
}))

export default useGenerateStore
