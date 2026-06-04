ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_shape text NOT NULL DEFAULT 'circle',
  ADD COLUMN IF NOT EXISTS pack_name_prefix text,
  ADD COLUMN IF NOT EXISTS pack_name_emoji text;