"use server";

import { createClient } from "@/lib/supabase/server";

interface BaseRequest {
  id: string;
  request_id?: string;
  user_id: string;
  prompt: string;
  status: string;
  created_at: string;
  aspect_ratio: string;
  error?: string;
}

interface ImageRequest extends BaseRequest {
  output_image?: string;
}

interface VideoRequest extends BaseRequest {
  duration: string;
  url?: string;
}

interface ProcessedImageRequest extends ImageRequest {
  type: 'image';
  duration: null;
}

interface ProcessedVideoRequest extends VideoRequest {
  type: 'video';
}

type ProcessedRequest = ProcessedImageRequest | ProcessedVideoRequest;

interface RequestsResponse {
  error: string | null;
  success: boolean;
  data: ProcessedRequest[] | null;
  count: number;
}

export async function getUserRequests(page: number = 1, limit: number = 10): Promise<RequestsResponse> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return {
      error: "User not authenticated",
      success: false,
      data: null,
      count: 0,
    };
  }

  // Pagination settings
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  try {
    // Fetch image requests
    const { data: imageRequests, error: imageError, count: imageCount } = await supabase
      .from("image_requests")
      .select("*", { count: "exact" })
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(start, end);

    if (imageError) {
      console.error("Error fetching image requests:", imageError);
      return {
        error: imageError.message,
        success: false,
        data: null,
        count: 0,
      };
    }

    // Fetch video requests
    const { data: videoRequests, error: videoError, count: videoCount } = await supabase
      .from("video_requests")
      .select("*", { count: "exact" })
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(start, end);

    if (videoError) {
      console.error("Error fetching video requests:", videoError);
      return {
        error: videoError.message,
        success: false,
        data: null,
        count: 0,
      };
    }

    // Get all image records from generated_images table for this user
    const { data: generatedImages } = await supabase
      .from("generated_images")
      .select("*")
      .eq("user_id", session.user.id);

    // Process image requests - replace fal.ai URLs with bucket URLs
    const processedImageRequests = await Promise.all(imageRequests.map(async (request: ImageRequest): Promise<ProcessedImageRequest> => {
      let imageUrl = request.output_image;
      
      // If request is completed and we have generated images
      if (request.status === 'completed' && generatedImages && generatedImages.length > 0) {
        // Try to find matching image by prompt and creation time (within 5 minutes)
        const requestDate = new Date(request.created_at);
        const matchingImage = generatedImages.find(img => {
          const promptMatch = img.prompt === request.prompt;
          const imgDate = new Date(img.created_at);
          const timeDiff = Math.abs(imgDate.getTime() - requestDate.getTime());
          const minutesDiff = timeDiff / (1000 * 60);
          
          return promptMatch && minutesDiff < 5; // Within 5 minutes
        });

        if (matchingImage) {
          // Get public URL from bucket
          const { data: urlData } = supabase
            .storage
            .from("generated_images")
            .getPublicUrl(`${session.user.id}/${matchingImage.image_name}`);

          if (urlData?.publicUrl) {
            imageUrl = urlData.publicUrl;
          }
        }
      }

      return {
        ...request,
        type: 'image',
        duration: null, // Add null duration for consistency
        output_image: imageUrl
      };
    }));

    // Process video requests data - make sure we retain the url field
    const processedVideoRequests = videoRequests.map((request: VideoRequest): ProcessedVideoRequest => {
      // The url field should already be in the request object if it exists
      // We don't need to do any special processing, just add the type field
      return {
        ...request,
        type: 'video'
      };
    });

    // Combine both types of requests
    const combinedRequests = [...processedImageRequests, ...processedVideoRequests]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return {
      error: null,
      success: true,
      data: combinedRequests,
      count: (imageCount || 0) + (videoCount || 0),
    };
  } catch (error) {
    console.error("Error fetching requests:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      success: false,
      data: null,
      count: 0,
    };
  }
} 