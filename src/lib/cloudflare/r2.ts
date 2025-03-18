import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { cache } from 'react';

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const WORKER_URL = process.env.NEXT_PUBLIC_VIDEO_POSTER_WORKER_URL || 'https://video-poster.stolamarcin.workers.dev';

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

// Interfejs dla mapy posterów
export interface PosterMap {
  [key: string]: string;
}

// Funkcja pobierająca mapę URL posterów z workera
export const getPosterMap = cache(async (): Promise<PosterMap> => {
  try {
    console.log(`Fetching poster map from: ${WORKER_URL}/map`);
    const response = await fetch(`${WORKER_URL}/map`);
    
    if (!response.ok) {
      console.error(`Poster map fetch failed with status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Poster map fetched successfully with ${Object.keys(data.map || {}).length} entries`);
    return data.map || {};
  } catch (error) {
    console.error('Error fetching poster map:', error);
    return {};
  }
});

export const listVideos = cache(async (): Promise<VideoData[]> => {
  const allVideos: VideoData[] = [];
  let continuationToken: string | undefined;
  
  // Najpierw pobierz mapę URL posterów
  const posterMap = await getPosterMap();

  try {
    do {
      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        MaxKeys: 1000, // Maximum allowed by S3, to get as many items as possible in one request
        ContinuationToken: continuationToken,
      });

      const response = await S3.send(command);
      
      // Process video objects and check for metadata
      for (const object of response.Contents || []) {
        if (!object.Key) continue;
        
        const key = object.Key;
        // Skip poster images
        if (key.endsWith('_poster.jpg')) continue;
        
        // Only process video files
        if (!key.match(/\.(mp4|mov|webm|avi)$/i)) continue;
        
        const videoUrl = `https://bucket.facesfactory.com/${encodeURIComponent(key)}`;
        
        // Najpierw sprawdź mapę posterów
        let posterUrl = posterMap[key];
        
        // Jeśli nie ma w mapie, to użyj default
        if (!posterUrl) {
          posterUrl = `${videoUrl}?poster=true`; // Default fallback
          
          try {
            // Get object metadata
            const headCommand = new HeadObjectCommand({
              Bucket: R2_BUCKET_NAME,
              Key: key,
            });
            
            const headResponse = await S3.send(headCommand);
            
            // Check if we have a poster URL in metadata
            if (headResponse.Metadata?.posterurl) {
              posterUrl = headResponse.Metadata.posterurl;
            } else {
              // Check if a poster file exists (naming convention)
              const posterKey = key.replace(/\.[^/.]+$/, "") + "_poster.jpg";
              posterUrl = `https://bucket.facesfactory.com/${encodeURIComponent(posterKey)}`;
            }
          } catch (error) {
            console.error(`Error getting metadata for ${key}:`, error);
            // Continue with the default poster URL on error
          }
        }
        
        allVideos.push({
          id: key,
          video_url: videoUrl,
          poster_url: posterUrl,
          lastModified: object.LastModified,
          size: object.Size,
        });
      }
      
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return allVideos;
  } catch (error) {
    console.error('Error listing videos from R2:', error);
    throw error;
  }
}); 