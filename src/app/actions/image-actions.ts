"use server";

import { Database } from "@database.types";
import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";
import { imageMeta } from "image-meta";
import { getCredits } from "./credit-actions";
import { createClient } from "@/lib/supabase/server";
import { createClientWithOptions } from "@/lib/supabase/server-fetch";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface ImageResponse {
  error: string | null;
  success: boolean;
  data: Record<string, unknown> | null;
}

type StoreImageInput = {
  url: string;
} & Database["public"]["Tables"]["generated_images"]["Insert"];

export async function storeImages(
  data: StoreImageInput[],
): Promise<ImageResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      data: null,
    };
  }

  const uploadResults = [];

  for (const img of data) {
    const arrayBuffer = await imgUrlToBlob(img.url);
    const { width, height, type } = imageMeta(new Uint8Array(arrayBuffer));

    const fileName = `image_${randomUUID()}.${type}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: storageError } = await supabase.storage
      .from("generated_images")
      .upload(filePath, arrayBuffer, {
        contentType: `image/${type}`,
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) {
      uploadResults.push({
        fileName,
        error: storageError.message,
        success: false,
        data: null,
      });
      continue;
    }

    const { data: dbData, error: dbError } = await supabase
      .from("generated_images")
      .insert([{
        user_id: user.id,
      
        prompt: img.prompt,
        aspect_ratio: img.aspect_ratio,
    
        image_name: fileName,
        width,
        height,
      }])
      .select();

    uploadResults.push({
      fileName,
      error: dbError?.message || null,
      success: !dbError,
      data: dbData || null,
    });
  }

  revalidateTag("gallery-images");
  revalidateTag("dashboard-images");

  return {
    error: null,
    success: true,
    data: { results: uploadResults },
  };
}

export async function imgUrlToBlob(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  const blob = await response.blob();
  return blob.arrayBuffer();
}

export async function getPresignedStorageUrl(filePath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: urlData, error } = await supabaseAdmin.storage.from(
    "training_data",
  ).createSignedUploadUrl(`${user?.id}/${new Date().getTime()}_${filePath}`, {
    upsert: false,
  });
  return { signedUrl: urlData?.signedUrl || "", error: error?.message || null };
}

export async function getImages(page = 1, limit = 12) {
  const cacheOptions = {
    cache: "force-cache",
    next: {
      tags: ["dashboard-images", "gallery-images"],
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

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, error, count } = await supabase
    .from("generated_images")
    .select("*", { count: "exact" })
    .eq("user_id", user?.id || "")
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    return {
      error: error.message || "Failed to fetch images",
      success: false,
      data: null,
      count: 0,
    };
  }

  const imagesWithUrls = await Promise.all(
    data.map(
      async (
        image: Database["public"]["Tables"]["generated_images"]["Row"],
      ) => {
        const { data: urlData } = await supabase
          .storage
          .from("generated_images")
          .createSignedUrl(`${user?.id || ""}/${image.image_name}`, 3600);

        return {
          ...image,
          url: urlData?.signedUrl,
        };
      },
    ),
  );

  return {
    error: null,
    success: true,
    data: imagesWithUrls || null,
    count: count || 0,
  };
}

export async function deleteImage(id: string, imageName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // throw new Error("Unauthorized");
    return {
      error: "Unauthorized",
      success: false,
      message: "Failed to delete image",
    };
  }

  const { error, data } = await supabase.from("generated_images").delete().eq(
    "id",
    id,
  ).eq("user_id", user.id);

  if (error) {
    return { error: error.message, success: false, data: null };
  }

  await supabase.storage.from("generated_images").remove([
    `${user.id}/${imageName}`,
  ]);

  revalidateTag("dashboard-images");
  revalidateTag("gallery-images");

  return { error: null, success: true, data: data };
}

export async function checkAndUpdateCredits(): Promise<{ 
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

  const currentCount = credits.data.image_generation_count ?? 0;
  const maxCount = credits.data.max_image_generation_count ?? 0;

  if (currentCount >= maxCount) {
    return { 
      hasCredits: false, 
      credits: credits.data, 
      error: "No credits remaining" 
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("credits")
    .update({ 
      image_generation_count: currentCount + 1 
    })
    .eq("user_id", credits.data.user_id);

  if (error) {
    return { 
      hasCredits: false, 
      credits: credits.data, 
      error: "Failed to update credits" 
    };
  }

  revalidateTag("credits");
  return { 
    hasCredits: true, 
    credits: credits.data, 
    error: null 
  };
}
