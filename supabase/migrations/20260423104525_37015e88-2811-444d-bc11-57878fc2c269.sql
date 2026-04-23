-- App settings table for global app configuration (logo, etc)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view app settings"
ON public.app_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can insert app settings"
ON public.app_settings FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update app settings"
ON public.app_settings FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete app settings"
ON public.app_settings FOR DELETE
USING (is_admin());

-- Seed default logo entry
INSERT INTO public.app_settings (key, value)
VALUES ('app_logo_url', NULL)
ON CONFLICT (key) DO NOTHING;

-- Storage bucket for the app logo
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-logo', 'app-logo', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view app logo"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-logo');

CREATE POLICY "Admins can upload app logo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'app-logo' AND is_admin());

CREATE POLICY "Admins can update app logo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'app-logo' AND is_admin());

CREATE POLICY "Admins can delete app logo"
ON storage.objects FOR DELETE
USING (bucket_id = 'app-logo' AND is_admin());