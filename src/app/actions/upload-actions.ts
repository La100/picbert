"use server";

import { createClient } from "@/lib/supabase/server";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadVideo(file: File, userId: string) {
  const supabase = await createClient();
  
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${userId}/videos/${Date.now()}_${file.name}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, buffer, {
        contentType: "video/mp4",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get URL
    const { data: urlData } = await supabase.storage
      .from("videos")
      .createSignedUrl(fileName, 3600 * 24);

    if (!urlData?.signedUrl) {
      throw new Error('Failed to get video URL');
    }

    // Upload to Cloudinary
    const cloudinaryUpload = await cloudinary.uploader.upload(urlData.signedUrl, {
      resource_type: "video",
      folder: `${userId}/videos`,
      transformation: [
        { width: 720, height: 1280, crop: "fill" }
      ]
    });

    return { 
      url: cloudinaryUpload.secure_url, 
      path: fileName,
      cloudinaryPublicId: cloudinaryUpload.public_id
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function deleteVideo(path: string) {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase.storage
      .from("videos")
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
} 