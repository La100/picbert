"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"

export async function deleteAllVideos(userId: string) {
  const supabase = await createClient()
  
  try {
    // First check if there are any videos in storage
    const { data: storageFiles, error: listError } = await supabase
      .storage
      .from('generated_videos')
      .list(userId)

    if (listError) {
      console.error('Error listing videos:', listError)
      throw listError
    }

    // Delete all videos from storage if they exist
    if (storageFiles && storageFiles.length > 0) {
      const { error: storageError } = await supabase
        .storage
        .from('generated_videos')
        .remove(storageFiles.map(file => `${userId}/${file.name}`))

      if (storageError) {
        console.error('Error deleting videos from storage:', storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete all video records from the database
    const { error: dbError } = await supabase
      .from('generated_videos')
      .delete()
      .eq('user_id', userId)

    if (dbError) throw dbError

    revalidateTag("gallery-videos")
    revalidateTag("dashboard-videos")

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting videos:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete videos" 
    }
  }
}

export async function deleteAllPhotos(userId: string) {
  const supabase = await createClient()
  
  try {
    // First check if there are any photos in storage
    const { data: storageFiles, error: listError } = await supabase
      .storage
      .from('generated_images')
      .list(userId)

    if (listError) {
      console.error('Error listing photos:', listError)
      throw listError
    }

    // Delete all photos from storage if they exist
    if (storageFiles && storageFiles.length > 0) {
      const { error: storageError } = await supabase
        .storage
        .from('generated_images')
        .remove(storageFiles.map(file => `${userId}/${file.name}`))

      if (storageError) {
        console.error('Error deleting photos from storage:', storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete all photo records from the database
    const { error: dbError } = await supabase
      .from('generated_images')
      .delete()
      .eq('user_id', userId)

    if (dbError) throw dbError

    revalidateTag("gallery-images")
    revalidateTag("dashboard-images")

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting photos:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete photos" 
    }
  }
} 