"use server";

import { createClient } from "@/lib/supabase/server";
import { createClientWithOptions } from "@/lib/supabase/server-fetch";
import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";

interface ClientVideoResponse {
  error: string | null;
  success: boolean;
  data: Record<string, unknown> | null;
}

export async function uploadClientVideo(
  formData: FormData
): Promise<ClientVideoResponse> {
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
    const file = formData.get("file") as File;
    if (!file) {
      return {
        error: "No file provided",
        success: false,
        data: null,
      };
    }

    // Generate unique filename
    const fileName = `video_${randomUUID()}.mp4`;
    const filePath = `${user.id}/${fileName}`;

    // Upload to storage
    const { error: storageError } = await supabase.storage
      .from("client_videos")
      .upload(filePath, file, {
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
      .from("client_videos")
      .insert([{
        user_id: user.id,
        video_name: fileName,
        original_name: file.name,
      }])
      .select();

    if (dbError) {
      return {
        error: dbError.message,
        success: false,
        data: null,
      };
    }

    revalidateTag("client-videos");

    return {
      error: null,
      success: true,
      data: dbData[0] || null,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to upload video",
      success: false,
      data: null,
    };
  }
}

export async function getClientVideos() {
  const cacheOptions = {
    cache: "force-cache",
    next: {
      tags: ["client-videos"],
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

  const { data, error } = await supabase
    .from("client_videos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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
        .from("client_videos")
        .createSignedUrl(`${user.id}/${video.video_name}`, 3600);

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

export async function deleteClientVideo(id: string, videoName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      message: "Failed to delete video",
    };
  }

  const { error } = await supabase
    .from("client_videos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, success: false, data: null };
  }

  await supabase.storage
    .from("client_videos")
    .remove([`${user.id}/${videoName}`]);

  revalidateTag("client-videos");

  return { error: null, success: true, data: null };
} 