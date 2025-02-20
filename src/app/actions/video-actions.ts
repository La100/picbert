"use server";

import { Database } from "@database.types";
import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";
import { getCredits } from "./credit-actions";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createClientWithOptions } from "@/lib/supabase/server-fetch";
import { fal } from "@/lib/fal";


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

export async function getVideos(page?: number, pageSize: number = 12) {
  const cacheOptions = {
    cache: "force-cache",
    next: {
      tags: ["dashboard-videos", "gallery-videos"],
      revalidate: 3600,
    },
  };

  const supabase = await createClientWithOptions(cacheOptions);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      data: null,
      count: 0,
    };
  }

  let query = supabase
    .from("generated_videos")
    .select("*", { count: "exact" })
    .eq("user_id", user?.id || "")
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

  // Create signed URLs one by one but with better error handling
  const videosWithUrls = await Promise.all(
    (data || []).map(async (video) => {
      try {
        const { data: urlData } = await supabase
          .storage
          .from("generated_videos")
          .createSignedUrl(`${user.id}/${video.video_name}`, 3600);

        return {
          ...video,
          url: urlData?.signedUrl,
        };
      } catch (e) {
        console.error(`Failed to sign URL for video ${video.video_name}:`, e);
        return {
          ...video,
          url: null,
        };
      }
    })
  );

  return {
    error: null,
    success: true,
    data: videosWithUrls || null,
    count: count || 0,
  };
}

export async function deleteVideo(id: string, videoName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      message: "Failed to delete video",
    };
  }

  const { error, data } = await supabase
    .from("generated_videos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, success: false, data: null };
  }

  await supabase.storage
    .from("generated_videos")
    .remove([`${user.id}/${videoName}`]);

  revalidateTag("dashboard-videos");
  revalidateTag("gallery-videos");

  return { error: null, success: true, data: data };
}

export async function checkAndUpdateVideoCredits(): Promise<{ 
  hasCredits: boolean; 
  credits: Database["public"]["Tables"]["credits"]["Row"] | null;
  error: string | null;
}> {
  const credits = await getCredits();
  
  if (!credits || credits.error || !credits.data) {
    return { 
      hasCredits: false, 
      credits: null, 
      error: credits?.error || "Failed to fetch credits" 
    };
  }

  const currentCount = credits.data.video_generation_count ?? 0;
  const maxCount = credits.data.max_video_generation_count ?? 0;

  if (currentCount >= maxCount) {
    return { 
      hasCredits: false, 
      credits: credits.data, 
      error: "No video credits remaining" 
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("credits")
    .update({ 
      video_generation_count: currentCount + 1 
    })
    .eq("user_id", credits.data.user_id);

  if (error) {
    return { 
      hasCredits: false, 
      credits: credits.data, 
      error: "Failed to update video credits" 
    };
  }

  revalidateTag("credits");
  return { 
    hasCredits: true, 
    credits: credits.data, 
    error: null 
  };
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
    // Check credits first
    const creditCheck = await checkAndUpdateVideoCredits();
    if (!creditCheck.hasCredits) {
      return {
        error: creditCheck.error || "Insufficient credits",
        success: false,
        data: null,
      };
    }

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
    if (data.status === "pending") {
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