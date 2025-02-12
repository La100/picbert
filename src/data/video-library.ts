export interface VideoData {
  id: string;
  tags: string[];
  video_url: string;
}

export const videoLibraryData: VideoData[] = [
  {
    id: "video-1",
    tags: ["happy", "woman"],
    video_url: "https://vjvlsiuqjfotifoyqivh.supabase.co/storage/v1/object/public/client_videos//video_fabda98d-baca-47b4-afdf-06abc46943b3.mp4"
  },
  {
    id: "video-2",
    tags: ["happy", "woman"],
    video_url: "https://vjvlsiuqjfotifoyqivh.supabase.co/storage/v1/object/public/client_videos//video_de5007b6-9820-4109-aef9-9bda6329c68f.mp4"
  },
  {
    id: "video-3",
    tags: ["cmd", "gang","bob"],
    video_url: "https://vjvlsiuqjfotifoyqivh.supabase.co/storage/v1/object/public/client_videos//ugc-video-1738751352043.mp4"
  }
]; 