ALTER TABLE public.acapellas ADD COLUMN IF NOT EXISTS image_url TEXT;
COMMENT ON COLUMN public.acapellas.image_url IS 'Square profile image for the MC directory';