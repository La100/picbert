import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { storeVideo } from "@/app/actions/video-actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.request_id || !body.payload?.video?.url) {
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

    await supabase
      .from("video_requests")
      .update({ status: "completed" })
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