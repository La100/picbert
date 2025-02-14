export interface VideoData {
  tags: string[];
  video_url: string;
}

export const videoLibraryData: VideoData[] = Array(33).fill([
  {
    tags: ["happy", "woman"],
    video_url: "https://vjvlsiuqjfotifoyqivh.supabase.co/storage/v1/object/public/client_videos//video_fabda98d-baca-47b4-afdf-06abc46943b3.mp4"
  },
  {
    tags: ["happy", "woman"],
    video_url: "https://vjvlsiuqjfotifoyqivh.supabase.co/storage/v1/object/public/client_videos//video_de5007b6-9820-4109-aef9-9bda6329c68f.mp4"
  },
  {
    tags: ["cmd", "gang","bob"],
    video_url: "https://vjvlsiuqjfotifoyqivh.supabase.co/storage/v1/object/public/client_videos//ugc-video-1738751352043.mp4"
  }
]).flat(); 