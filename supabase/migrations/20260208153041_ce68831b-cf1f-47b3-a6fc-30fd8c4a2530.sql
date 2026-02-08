-- Add new profile fields for Discord-style profile
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS status_ring_color text DEFAULT '#10b981',
ADD COLUMN IF NOT EXISTS thought_bubble text,
ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'dark';

-- Create table for user badges/emblems
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_icon text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for badges
CREATE POLICY "Anyone can view badges" ON public.user_badges
FOR SELECT USING (true);

CREATE POLICY "Admins can manage badges" ON public.user_badges
FOR ALL USING (is_admin());

-- Create storage bucket for banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for banners bucket
CREATE POLICY "Anyone can view banners" ON storage.objects
FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can upload banners" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own banners" ON storage.objects
FOR UPDATE USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own banners" ON storage.objects
FOR DELETE USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);