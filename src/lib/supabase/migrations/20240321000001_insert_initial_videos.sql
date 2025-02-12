-- Insert initial videos
INSERT INTO public.client_videos (video_url, tags) VALUES
    ('https://vjvlsiuqjfotifoyqivh.supabase.co/storage/v1/object/public/client_videos//video_de5007b6-9820-4109-aef9-9bda6329c68f.mp4', ARRAY['landscape', 'nature']),

-- Note: After running this migration, you need to upload the actual video files
-- to the client_videos storage bucket with these filenames

-- ('url_do_video', ARRAY['tag1', 'tag2']); 