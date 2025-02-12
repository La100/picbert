"use server";

import { createClient } from "@/lib/supabase/server";
import { createClientWithOptions } from "@/lib/supabase/server-fetch";
import { randomUUID } from "crypto";

export interface ClientVideo {
  id: string;
  tags: string[];
  video_url: string;
}

export interface BulkVideoUpload {
  video_url: string;
  tags: string[];
}

export async function getClientVideos(page?: number, selectedTags: string[] = []) {
  const ITEMS_PER_PAGE = 15;
  const cacheOptions = {
    cache: "force-cache",
    next: {
      tags: ["client-videos"],
      revalidate: 3600,
    },
  };

  const supabase = await createClientWithOptions(cacheOptions);
  
  let query = supabase
    .from("client_videos")
    .select("*", { count: "exact" });

  // Apply tag filtering if tags are provided
  if (selectedTags.length > 0) {
    // Use overlaps to find videos that have any of the selected tags
    query = query.overlaps("tags", selectedTags);
  }

  // Apply pagination only if page is specified
  if (page) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;
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

  // Create signed URLs for each video
  const videosWithSignedUrls = await Promise.all(
    (data || []).map(async (video) => {
      try {
        // If the URL is already a full URL, use it directly
        if (video.video_url.startsWith('http')) {
          return video;
        }
        
        // Otherwise, create a signed URL
        const { data: urlData } = await supabase
          .storage
          .from("client_videos")
          .createSignedUrl(video.video_url, 3600);

        return {
          ...video,
          video_url: urlData?.signedUrl || video.video_url,
        };
      } catch (e) {
        console.error(`Failed to sign URL for video ${video.id}:`, e);
        return video;
      }
    })
  );

  return {
    error: null,
    success: true,
    data: videosWithSignedUrls as ClientVideo[],
    count: count || 0,
  };
}

export async function bulkAddVideos(videos: BulkVideoUpload[]) {
  const supabase = await createClient();

  const uploadResults = await Promise.all(
    videos.map(async (video) => {
      try {
        // Download video from URL
        const response = await fetch(video.video_url);
        const videoBlob = await response.blob();
        const arrayBuffer = await videoBlob.arrayBuffer();

        // Generate unique filename
        const fileName = `video_${randomUUID()}.mp4`;

        // Upload to storage
        const { error: storageError } = await supabase.storage
          .from("client_videos")
          .upload(fileName, arrayBuffer, {
            contentType: "video/mp4",
            cacheControl: "3600",
            upsert: false,
          });

        if (storageError) {
          throw storageError;
        }

        return {
          video_url: fileName,  // Store just the filename
          tags: video.tags,
        };
      } catch (error) {
        console.error('Failed to process video:', error);
        return null;
      }
    })
  );

  // Filter out failed uploads
  const successfulUploads = uploadResults.filter((result): result is NonNullable<typeof result> => result !== null);

  if (successfulUploads.length === 0) {
    return {
      error: "All video uploads failed",
      success: false,
      data: null,
    };
  }

  // Insert records into database
  const { data, error } = await supabase
    .from("client_videos")
    .insert(successfulUploads)
    .select();

  if (error) {
    return {
      error: error.message,
      success: false,
      data: null,
    };
  }

  return {
    error: null,
    success: true,
    data: data as ClientVideo[],
  };
}

export async function getAvailableTags() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("client_videos")
    .select("tags");

  if (error) {
    return {
      error: error.message,
      success: false,
      data: null,
    };
  }

  // Flatten and get unique tags
  const uniqueTags = [...new Set(data.flatMap(item => item.tags))].sort();

  return {
    error: null,
    success: true,
    data: uniqueTags,
  };
} 