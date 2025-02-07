import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    
    const uploadedResponse = await cloudinary.uploader.upload_large(data, {
      resource_type: "video",
      chunk_size: 6000000,
      eager: [
        { width: 1280, height: 720, crop: "pad" }  // Ensure 720p resolution
      ],
      eager_async: true,
      format: "mp4",
      quality: "auto:good",
      fetch_format: "auto"
    });

    return NextResponse.json({ url: uploadedResponse.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
} 