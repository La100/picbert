"use server";

import { createClient } from "@/lib/supabase/server";
import { cache } from 'react';

export interface ClientVideo {
  id: string;
  tags: string[];
  video_url: string;
  poster_url?: string;  // Optional for backward compatibility
}

export async function getClientVideos(page?: number, selectedTags: string[] = []) {
  const ITEMS_PER_PAGE = 15;
  
  const supabase = await createClient();
  
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
        
        // Otherwise, create a public URL
        const { data: urlData } = supabase
          .storage
          .from("client_videos")
          .getPublicUrl(video.video_url);

        return {
          ...video,
          video_url: urlData.publicUrl || video.video_url,
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

// Cachowana wersja getClientVideos
export const getCachedClientVideos = cache(async (page?: number, selectedTags: string[] = []) => {
  return getClientVideos(page, selectedTags);
});

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