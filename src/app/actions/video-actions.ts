"use server";

import { Database } from "@database.types";
import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";
import { getCredits } from "./credit-actions";
import { createClient } from "@/lib/supabase/server";
import { createClientWithOptions } from "@/lib/supabase/server-fetch";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
};

export async function storeVideo(
  data: StoreVideoInput,
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
    // Download video from URL
    const response = await fetch(data.url);
    const videoBlob = await response.blob();
    const arrayBuffer = await videoBlob.arrayBuffer();

    // Generate unique filename
    const fileName = `video_${randomUUID()}.mp4`;
    const filePath = `${user.id}/${fileName}`;

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
        user_id: user.id,
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
      data: dbData,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to store video",
      success: false,
      data: null,
    };
  }
}

export async function getVideos(limit?: number) {
  const cacheOptions = {
    cache: "force-cache",
    next: {
      tags: ["dashboard-videos", "gallery-videos"],
    },
  };

  const supabase = await createClientWithOptions(cacheOptions);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      data: null,
    };
  }

  let query = supabase
    .from("generated_videos")
    .select("*")
    .eq("user_id", user?.id || "")
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    return {
      error: error.message || "Failed to fetch videos",
      success: false,
      data: null,
    };
  }

  const videosWithUrls = await Promise.all(
    data.map(async (video) => {
      const { data: urlData } = await supabase
        .storage
        .from("generated_videos")
        .createSignedUrl(`${user?.id || ""}/${video.video_name}`, 3600);

      return {
        ...video,
        url: urlData?.signedUrl,
      };
    }),
  );

  return {
    error: null,
    success: true,
    data: videosWithUrls || null,
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