import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { storeVideo } from "@/app/actions/video-actions";
import { manageTokens } from "@/app/actions/token-actions";
import { VIDEO_TOKEN_COST_5_SEC, VIDEO_TOKEN_COST_10_SEC } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.request_id || (!body.payload?.video?.url && !body.detail)) {
      return NextResponse.json({ 
        error: "Invalid webhook data - missing required fields"
      }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: requestData, error: dbError } = await supabase
      .from("video_requests")
      .select("*")
      .eq("request_id", body.request_id)
      .single();

    if (dbError || !requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Handle risk control system failure
    if (body.detail === "Failure to pass the risk control system") {
      // Calculate token refund amount (only charge 10 tokens)
      const fullCost = requestData.duration === "5" ? VIDEO_TOKEN_COST_5_SEC : VIDEO_TOKEN_COST_10_SEC;
      const refundAmount = fullCost - 10; // Only charge 10 tokens for NSFW detection

      // Refund tokens to user
      if (refundAmount > 0) {
        await manageTokens('add', refundAmount);
      }

      // Update request status
      await supabase
        .from("video_requests")
        .update({ 
          status: "failed",
          error: "Content flagged by NSFW filter. Only 10 tokens have been charged."
        })
        .eq("request_id", body.request_id);

      return NextResponse.json({ 
        error: "Content flagged by NSFW filter",
        partial_charge: true
      }, { status: 400 });
    }

    // Normal success case
    const storeResult = await storeVideo({
      url: body.payload.video.url,
      prompt: requestData.prompt,
      input_image: requestData.input_image,
      aspect_ratio: requestData.aspect_ratio,
      duration: requestData.duration,
      user_id: requestData.user_id,
    });

    if (storeResult.error) {
      return NextResponse.json({ error: storeResult.error }, { status: 500 });
    }

    // Generate the bucket URL for the video
    let bucketVideoUrl = body.payload.video.url; // Default to fal.ai URL as fallback
    
    if (storeResult.data && storeResult.data.video_name) {
      // Get public URL from Supabase bucket
      const { data: urlData } = supabase
        .storage
        .from("generated_videos")
        .getPublicUrl(`${requestData.user_id}/${storeResult.data.video_name}`);
        
      if (urlData?.publicUrl) {
        bucketVideoUrl = urlData.publicUrl;
      }
    }

    await supabase
      .from("video_requests")
      .update({ 
        status: "completed",
        url: bucketVideoUrl  // Use Supabase bucket URL
      })
      .eq("request_id", body.request_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Video webhook error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 