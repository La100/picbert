import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadVideo, deleteVideo } from '@/app/actions/upload-actions';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('videos') as File[];
    
    if (files.length !== 2) {
      throw new Error('Please provide both videos');
    }

    // Upload both videos
    const [firstVideo, secondVideo] = files;
    const [firstUpload, secondUpload] = await Promise.all([
      uploadVideo(firstVideo, user.id),
      uploadVideo(secondVideo, user.id)
    ]);

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from("ads")
      .insert([{
        user_id: user.id,
        ugc_video_url: firstUpload.url,
        client_video_url: secondUpload.url,
        ugc_video_path: firstUpload.path,
        client_video_path: secondUpload.path
      }])
      .select();

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({ 
      success: true,
      data: dbData[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to upload videos" 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      throw new Error('No ad ID provided');
    }

    // Get ad data
    const { data: adData, error: fetchError } = await supabase
      .from("ads")
      .select()
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Delete videos from storage
    await Promise.all([
      deleteVideo(adData.ugc_video_path),
      deleteVideo(adData.client_video_path)
    ]);

    // Delete from database
    const { error: deleteError } = await supabase
      .from("ads")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to delete ad" 
    }, { status: 500 });
  }
} 