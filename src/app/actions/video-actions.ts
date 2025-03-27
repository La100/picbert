"use server";

import { Database } from "@database.types";
import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

import { fal } from "@/lib/fal";
import { processTokenOperation } from "./token-actions";
import { VIDEO_TOKEN_COST_5_SEC, VIDEO_TOKEN_COST_10_SEC } from "@/lib/constants";
import { cache } from 'react';


interface VideoResponse {
  error: string | null;
  success: boolean;
  data: Record<string, unknown> | null;
}

type StoreVideoInput = {
  url: string;
  prompt: string;
  input_image: string;
  aspect_ratio: string;
  duration: string;
  user_id?: string; // Optional for backward compatibility
};

interface QueueVideoInput {
  prompt: string;
  input_image: string;
  aspect_ratio: "16:9" | "9:16" | "1:1";
  duration: "5" | "10";
}

export async function storeVideo(
  data: StoreVideoInput,
): Promise<VideoResponse> {
  // If user_id is provided, use service client (for webhook case)
  // Otherwise use normal client (for user case)
  const supabase = data.user_id ? createServiceClient() : await createClient();
  
  // If user_id is provided, use it directly (for webhook case)
  // Otherwise get it from auth (for normal case)
  let userId = data.user_id;
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        error: "Unauthorized",
        success: false,
        data: null,
      };
    }
    userId = user.id;
  }

  try {
    // Download video from URL
    const response = await fetch(data.url);
    const videoBlob = await response.blob();
    const arrayBuffer = await videoBlob.arrayBuffer();

    // Generate unique filename
    const fileName = `video_${randomUUID()}.mp4`;
    const filePath = `${userId}/${fileName}`;

    // Upload to storage
    const { error: storageError } = await supabase.storage
      .from("generated_videos")
      .upload(filePath, arrayBuffer, {
        contentType: "video/mp4",
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) {
      return {
        error: storageError.message,
        success: false,
        data: null,
      };
    }

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from("generated_videos")
      .insert([{
        user_id: userId,
        prompt: data.prompt,
        input_image: data.input_image,
        aspect_ratio: data.aspect_ratio,
        duration: data.duration,
        video_name: fileName,
      }])
      .select();

    if (dbError) {
      return {
        error: dbError.message,
        success: false,
        data: null,
      };
    }

    revalidateTag("gallery-videos");
    revalidateTag("dashboard-videos");

    return {
      error: null,
      success: true,
      data: dbData[0] || null,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to store video",
      success: false,
      data: null,
    };
  }
}

export async function getVideos(page: number = 1, pageSize: number = 12) {
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

  let query = supabase
    .from("generated_videos")
    .select("*", { count: "exact" })
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (page && pageSize) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end);
  }

  const { data, error, count } = await query;

  if (error) {
    return {
      error: error.message,
      success: false,
      data: null,
      count: 0,
    };
  }

  // Użyj getPublicUrl zamiast createSignedUrl
  const videosWithUrls = (data || []).map((video) => {
    try {
      // Get public URL for video
      const { data: videoUrlData } = supabase
        .storage
        .from("generated_videos")
        .getPublicUrl(`${session.user.id}/${video.video_name}`);

      // Handle input_image
      let imageUrl = video.input_image;
      
      // If input_image is from the inputimage bucket
      if (video.input_image && video.input_image.includes('inputimage')) {
        // The URL is already correct - public bucket with RLS
        imageUrl = video.input_image;
      }
      // If input_image is a path to a file in storage (generated_images bucket - legacy flow)
      else if (video.input_image && !video.input_image.startsWith('http')) {
        // Extract image name from the input_image URL if it's a path
        const imageMatch = video.input_image.match(/\/([^\/]+?)(?:\?|$)/);
        const imageName = imageMatch ? imageMatch[1] : video.input_image;
        
        // Get public URL for input image
        const { data: imageUrlData } = supabase
          .storage
          .from("generated_images")
          .getPublicUrl(`${session.user.id}/${imageName}`);
          
        imageUrl = imageUrlData.publicUrl;
      } 
      // If input_image is already a full URL (signed URL - legacy flow)
      else if (video.input_image && video.input_image.includes('supabase.co/storage/v1/object/sign')) {
        // Convert signed URL to public URL
        const urlParts = video.input_image.split('/');
        const bucketIndex = urlParts.findIndex((part: string) => part === 'storage') + 2;
        const pathIndex = bucketIndex + 1;
        
        if (bucketIndex > 0 && pathIndex < urlParts.length) {
          const bucket = urlParts[bucketIndex];
          const path = urlParts.slice(pathIndex).join('/').split('?')[0];
          
          const { data: imageUrlData } = supabase
            .storage
            .from(bucket)
            .getPublicUrl(path);
            
          imageUrl = imageUrlData.publicUrl;
        }
      }

      return {
        ...video,
        url: videoUrlData.publicUrl,
        input_image: imageUrl,
      };
    } catch (e) {
      console.error(`Failed to get URLs for video ${video.video_name}:`, e);
      return {
        ...video,
        url: null,
        input_image: video.input_image,
      };
    }
  });

  return {
    error: null,
    success: true,
    data: videosWithUrls || null,
    count: count || 0,
  };
}

// Cachowana wersja getVideos
export const getCachedVideos = cache(async (page: number = 1, pageSize: number = 12) => {
  return getVideos(page, pageSize);
});

export async function deleteVideo(id: string, videoName: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return {
      error: "Unauthorized",
      success: false,
      message: "Failed to delete video",
    };
  }

  try {
    // First check if the file exists in storage
    const { data: storageFiles } = await supabase.storage
      .from("generated_videos")
      .list(session.user.id);

    const fileExists = storageFiles?.some(file => file.name === videoName);

    // Delete from database first
    const { error: dbError, data } = await supabase
      .from("generated_videos")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (dbError) {
      return { error: dbError.message, success: false, data: null };
    }

    // Only try to delete from storage if the file exists
    if (fileExists) {
      const { error: storageError } = await supabase.storage
        .from("generated_videos")
        .remove([`${session.user.id}/${videoName}`]);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
        // Don't return error here as the database record is already deleted
      }
    }

    revalidateTag("dashboard-videos");
    revalidateTag("gallery-videos");

    return { error: null, success: true, data: data };
  } catch (error) {
    console.error("Error in deleteVideo:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to delete video", 
      success: false, 
      data: null 
    };
  }
}

export async function checkAndUpdateVideoCredits(duration: "5" | "10" = "5"): Promise<{ 
  hasCredits: boolean; 
  credits: Database["public"]["Tables"]["credits"]["Row"] | null;
  error: string | null;
}> {
  const tokenCost = duration === "5" ? VIDEO_TOKEN_COST_5_SEC : VIDEO_TOKEN_COST_10_SEC;
  return processTokenOperation('deduct', tokenCost, `${duration}-second video generation`);
}

export async function queueVideoGeneration(
  data: QueueVideoInput
): Promise<VideoResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      data: null,
    };
  }

  try {
    // Credits are already checked and deducted in the VideoConfigurations component
    // No need to check or deduct credits again here
    console.log("Queuing video generation - tokens already deducted in frontend");

    // Get webhook URL from environment
    const webhookUrl = process.env.NEXT_PUBLIC_VIDEO_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error("Webhook URL not configured");
    }

    // Submit to fal.ai queue
    const { request_id } = await fal.queue.submit("fal-ai/kling-video/v1.6/pro/image-to-video", {
      input: {
        prompt: data.prompt,
        image_url: data.input_image,
        aspect_ratio: data.aspect_ratio as "16:9" | "9:16" | "1:1",
        duration: data.duration as "5" | "10",
      },
      webhookUrl,
    });

    // Store request in database
    const { data: requestData, error: dbError } = await supabase
      .from("video_requests")
      .insert([{
        user_id: user.id,
        request_id,
        prompt: data.prompt,
        input_image: data.input_image,
        aspect_ratio: data.aspect_ratio,
        duration: data.duration,
        status: "pending"
      }])
      .select()
      .single();

    if (dbError) {
      return {
        error: dbError.message,
        success: false,
        data: null,
      };
    }

    return {
      error: null,
      success: true,
      data: requestData,
    };
  } catch (error) {
    // If there's an error with fal.ai or any other part of video generation, refund the tokens
    const tokenCost = data.duration === "5" ? VIDEO_TOKEN_COST_5_SEC : VIDEO_TOKEN_COST_10_SEC;
    
    try {
      // Import directly inside the catch block to avoid circular dependencies
      const { addTokens } = await import('./token-actions');
      await addTokens(tokenCost);
      console.log(`Refunded ${tokenCost} tokens due to video generation error`);
    } catch (refundError) {
      console.error("Failed to refund tokens:", refundError);
    }
    
    return {
      error: error instanceof Error ? error.message : "Failed to queue video generation",
      success: false,
      data: null,
    };
  }
}

export async function getVideoRequestStatus(requestId: string): Promise<VideoResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      data: null,
    };
  }

  try {
    const { data, error } = await supabase
      .from("video_requests")
      .select("*")
      .eq("request_id", requestId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return {
        error: error.message,
        success: false,
        data: null,
      };
    }

    // If request is still pending, check fal.ai status
    if (data.status === "pending" || data.status === "processing") {
      const status = await fal.queue.status("fal-ai/kling-video/v1.6/pro/image-to-video", {
        requestId,
        logs: true,
      });

      // Map fal.ai status to our database status
      let newStatus;
      let errorMessage = null;
      
      switch (status.status) {
        case "IN_QUEUE":
          newStatus = "pending";
          break;
        case "IN_PROGRESS":
          newStatus = "processing";
          break;
        case "COMPLETED":
          newStatus = "completed";
          break;
        default:
          newStatus = "failed";
          errorMessage = "Generation failed";
          
          // Refund tokens if the generation failed
          try {
            // Determine token cost based on video duration
            const tokenCost = data.duration === "5" ? VIDEO_TOKEN_COST_5_SEC : VIDEO_TOKEN_COST_10_SEC;
            
            // Import token actions directly to avoid circular dependencies
            const { addTokens } = await import('./token-actions');
            await addTokens(tokenCost);
            console.log(`Refunded ${tokenCost} tokens due to failed video generation`);
          } catch (refundError) {
            console.error("Failed to refund tokens:", refundError);
          }
      }

      // Update status in database
      await supabase
        .from("video_requests")
        .update({ 
          status: newStatus,
          ...(errorMessage && { error: errorMessage }),
       
        })
        .eq("request_id", requestId);

      // Return appropriate response
      if (newStatus === "failed") {
        return {
          error: errorMessage,
          success: false,
          data: null,
        };
      }

      // Update data with new status
      data.status = newStatus;
    
    }

    return {
      error: null,
      success: true,
      data,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to get video status",
      success: false,
      data: null,
    };
  }
} 