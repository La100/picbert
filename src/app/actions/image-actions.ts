"use server";

import { Database } from "@database.types";
import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";
import { imageMeta } from "image-meta";
import { getCredits } from "./credit-actions";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checkTokens, deductTokens } from "./token-actions";
import { IMAGE_TOKEN_COST } from "@/lib/constants";
import { cache } from 'react';

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
  console.log("Starting storeImages with data:", data.length, "images");
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user found");
    return {
      error: "Unauthorized",
      success: false,
      data: null,
    };
  }

  const uploadResults = [];
  let hasErrors = false;

  for (const img of data) {
    try {
      console.log("Processing image with URL:", img.url.substring(0, 50) + "...");
      
      // Convert image URL to blob
      const arrayBuffer = await imgUrlToBlob(img.url);
      if (!arrayBuffer) {
        console.error("Failed to convert image URL to blob");
        hasErrors = true;
        uploadResults.push({
          error: "Failed to process image data",
          success: false,
          data: null,
        });
        continue;
      }

      // Get image metadata
      const { width, height, type } = imageMeta(new Uint8Array(arrayBuffer));
      console.log("Image metadata:", { width, height, type });

      const fileName = `image_${randomUUID()}.${type}`;
      const filePath = `${user.id}/${fileName}`;
      console.log("Generated file path:", filePath);

      // Upload to storage
      const { error: storageError } = await supabase.storage
        .from("generated_images")
        .upload(filePath, arrayBuffer, {
          contentType: `image/${type}`,
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        console.error("Storage error:", storageError);
        hasErrors = true;
        uploadResults.push({
          fileName,
          error: storageError.message,
          success: false,
          data: null,
        });
        continue;
      }
      
      console.log("Successfully uploaded image to storage");

      // Insert record in database
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

      if (dbError) {
        console.error("Database error:", dbError);
        hasErrors = true;
      } else {
        console.log("Successfully inserted image record in database");
      }

      uploadResults.push({
        fileName,
        error: dbError?.message || null,
        success: !dbError,
        data: dbData || null,
      });
    } catch (error) {
      console.error("Error in storeImages:", error);
      hasErrors = true;
      uploadResults.push({
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
        data: null,
      });
    }
  }

  // Revalidate cache tags
  revalidateTag("gallery-images");
  revalidateTag("dashboard-images");
  revalidateTag("credits");
  
  console.log("Completed storeImages with results:", { 
    success: !hasErrors, 
    resultsCount: uploadResults.length 
  });

  return {
    error: hasErrors ? "Some images failed to upload" : null,
    success: !hasErrors,
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

export async function getImages(page: number = 1, limit: number = 12) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "User not authenticated",
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
    .eq("user_id", user.id)
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

  const imagesWithUrls = data.map(
    (image: Database["public"]["Tables"]["generated_images"]["Row"]) => {
      try {
        const { data: urlData } = supabase
          .storage
          .from("generated_images")
          .getPublicUrl(`${user.id}/${image.image_name}`);

        return {
          ...image,
          url: urlData.publicUrl,
        };
      } catch (e) {
        console.error(`Failed to get URL for image ${image.image_name}:`, e);
        return {
          ...image,
          url: null,
        };
      }
    }
  );

  return {
    error: null,
    success: true,
    data: imagesWithUrls || null,
    count: count || 0,
  };
}

export const getCachedImages = cache(async (page?: number, limit: number = 12) => {
  return getImages(page, limit);
});

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
  try {
    // First check if user has enough tokens
    const checkResult = await checkTokens(IMAGE_TOKEN_COST);
    
    if (!checkResult.success) {
      console.log("Not enough tokens for image generation:", checkResult);
      return { 
        hasCredits: false, 
        credits: null, 
        error: checkResult.error || "Not enough tokens for image generation" 
      };
    }
    
    // If they have enough tokens, deduct them directly
    const deductResult = await deductTokens(IMAGE_TOKEN_COST);
    console.log("Token deduction result:", deductResult);
    
    if (!deductResult.success) {
      console.error("Failed to deduct tokens:", deductResult.error);
      return { 
        hasCredits: false, 
        credits: null, 
        error: deductResult.error || "Failed to deduct tokens" 
      };
    }
    
    // Update image generation count
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      try {
        // Get current credits
        const { data: creditsData } = await supabase
          .from('credits')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (creditsData) {
          // Update image generation count
          try {
            const { error: updateError } = await supabase
              .from('credits')
              .update({ 
                image_generation_count: (creditsData.image_generation_count || 0) + 1 
              })
              .eq('user_id', user.id);
              
            if (updateError) {
              console.error("Error updating image_generation_count:", updateError);
            } else {
              console.log("Updated image_generation_count successfully");
            }
          } catch (updateError) {
            // Log error but don't fail the operation
            console.error("Failed to update image_generation_count:", updateError);
          }
        }
      } catch (creditsError) {
        console.error("Error fetching/updating credits:", creditsError);
      }
    }
    
    // Get updated credits
    const credits = await getCredits();
    
    return { 
      hasCredits: true, 
      credits: credits.data || null, 
      error: null 
    };
  } catch (error) {
    console.error("Error in checkAndUpdateCredits:", error);
    return {
      hasCredits: false,
      credits: null,
      error: error instanceof Error ? error.message : "Failed to process tokens"
    };
  }
}
