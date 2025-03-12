import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { cache } from 'react';

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
  poster_url: string;
  lastModified?: Date;
  size?: number;
}

export const listVideos = cache(async (): Promise<VideoData[]> => {
  const allVideos: VideoData[] = [];
  let continuationToken: string | undefined;

  try {
    do {
      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        MaxKeys: 1000, // Maximum allowed by S3, to get as many items as possible in one request
        ContinuationToken: continuationToken,
      });

      const response = await S3.send(command);
      
      const videos = response.Contents?.map((object) => {
        const key = object.Key || '';
        const videoUrl = `https://bucket.facesfactory.com/${encodeURIComponent(key)}`;
        
        return {
          id: key,
          video_url: videoUrl,
          poster_url: `${videoUrl}?poster=true`,
          lastModified: object.LastModified,
          size: object.Size,
        };
      }) || [];

      allVideos.push(...videos);
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return allVideos;
  } catch (error) {
    console.error('Error listing videos from R2:', error);
    throw error;
  }
}); 