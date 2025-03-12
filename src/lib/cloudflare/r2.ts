import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  throw new Error('Missing required R2 environment variables');
}

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface VideoData {
  id: string;
  video_url: string;
  tags: string[];
  lastModified?: Date;
  size?: number;
}

export async function listVideos(): Promise<VideoData[]> {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
  });

  try {
    const response = await S3.send(command);
    const videos = response.Contents?.map((object) => {
      const key = object.Key || '';
      // Extract tags from the filename or key structure
      // Assuming files are named like: category1-category2-filename.mp4
      const tags = key.split('.')[0].split('-').slice(0, -1);
      
      return {
        id: key,
        video_url: `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`,
        tags: tags.length > 0 ? tags : ['uncategorized'],
        lastModified: object.LastModified,
        size: object.Size,
      };
    }) || [];

    return videos;
  } catch (error) {
    console.error('Error listing videos from R2:', error);
    throw error;
  }
} 