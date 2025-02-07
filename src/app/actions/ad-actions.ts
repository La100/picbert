"use server";

import { createClient } from "@/lib/supabase/server";
import { createClientWithOptions } from "@/lib/supabase/server-fetch";
import { revalidateTag } from "next/cache";

interface AdResponse {
  error: string | null;
  success: boolean;
  data: Record<string, unknown> | null;
}

interface SaveAdInput {
  ugcVideoUrl: string;
  clientVideoUrl: string;
}

export async function saveAd(data: SaveAdInput): Promise<AdResponse> {
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
    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from("ads")
      .insert([{
        user_id: user.id,
        ugc_video_url: data.ugcVideoUrl,
        client_video_url: data.clientVideoUrl,
      }])
      .select();

    if (dbError) {
      return {
        error: dbError.message,
        success: false,
        data: null,
      };
    }

    revalidateTag("ads");

    return {
      error: null,
      success: true,
      data: dbData[0] || null,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to save ad",
      success: false,
      data: null,
    };
  }
}

export async function getAds() {
  const cacheOptions = {
    cache: "force-cache",
    next: {
      tags: ["ads"],
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
    .from("ads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      error: error.message || "Failed to fetch ads",
      success: false,
      data: null,
    };
  }

  return {
    error: null,
    success: true,
    data: data || null,
  };
}

export async function deleteAd(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      message: "Failed to delete ad",
    };
  }

  const { error } = await supabase
    .from("ads")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, success: false, data: null };
  }

  revalidateTag("ads");

  return { error: null, success: true, data: null };
} 