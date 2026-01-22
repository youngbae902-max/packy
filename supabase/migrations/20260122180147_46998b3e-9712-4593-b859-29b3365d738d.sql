-- Add status column to albums table for approval system
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Add bio and social links to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spotify_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS soundcloud_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS youtube_url text;

-- Update RLS for albums - allow pending albums to be visible only to admins
DROP POLICY IF EXISTS "Anyone can view albums " ON public.albums;
CREATE POLICY "Anyone can view approved albums" ON public.albums 
FOR SELECT USING (status = 'approved' OR is_admin());

-- Add index for album status
CREATE INDEX IF NOT EXISTS idx_albums_status ON public.albums(status);