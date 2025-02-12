-- Create the client_videos table
CREATE TABLE IF NOT EXISTS public.client_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tags TEXT[] DEFAULT '{}',
    video_url TEXT NOT NULL,
    input_image_url TEXT,
    image_prompt TEXT,
    video_prompt TEXT
);

-- Create index for tags search
CREATE INDEX IF NOT EXISTS idx_client_videos_tags ON public.client_videos USING GIN (tags);

-- Add RLS policies
ALTER TABLE public.client_videos ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access for authenticated users" ON public.client_videos
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow all access to service_role
CREATE POLICY "Allow all access to service_role" ON public.client_videos
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Remove unnecessary columns
ALTER TABLE public.client_videos
    DROP COLUMN input_image_url,
    DROP COLUMN image_prompt,
    DROP COLUMN video_prompt; 