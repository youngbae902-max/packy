INSERT INTO storage.buckets (id, name, public)
VALUES ('emojis', 'emojis', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Emoji images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'emojis');

CREATE POLICY "Admins can upload emoji images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'emojis' AND public.is_admin());

CREATE POLICY "Admins can update emoji images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'emojis' AND public.is_admin())
WITH CHECK (bucket_id = 'emojis' AND public.is_admin());

CREATE POLICY "Admins can delete emoji images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'emojis' AND public.is_admin());