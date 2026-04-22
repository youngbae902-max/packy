-- Create sites table
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  site_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sites"
ON public.sites FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all sites"
ON public.sites FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert sites"
ON public.sites FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update sites"
ON public.sites FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete sites"
ON public.sites FOR DELETE
USING (is_admin());

CREATE TRIGGER update_sites_updated_at
BEFORE UPDATE ON public.sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for site images
INSERT INTO storage.buckets (id, name, public)
VALUES ('sites', 'sites', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view site images"
ON storage.objects FOR SELECT
USING (bucket_id = 'sites');

CREATE POLICY "Admins can upload site images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sites' AND is_admin());

CREATE POLICY "Admins can update site images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'sites' AND is_admin());

CREATE POLICY "Admins can delete site images"
ON storage.objects FOR DELETE
USING (bucket_id = 'sites' AND is_admin());