ALTER TABLE public.packs
ADD COLUMN IF NOT EXISTS requires_shortener boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.custom_emojis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  shortcode text NOT NULL UNIQUE,
  image_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_emojis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active custom emojis"
ON public.custom_emojis
FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert custom emojis"
ON public.custom_emojis
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update custom emojis"
ON public.custom_emojis
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete custom emojis"
ON public.custom_emojis
FOR DELETE
USING (public.is_admin());

CREATE TRIGGER update_custom_emojis_updated_at
BEFORE UPDATE ON public.custom_emojis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();