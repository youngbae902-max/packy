ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_favorites_section boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_reposts_section boolean NOT NULL DEFAULT true;