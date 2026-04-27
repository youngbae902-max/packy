ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS verified_badge_color text DEFAULT '#10b981',
ADD COLUMN IF NOT EXISTS admin_badge_color text DEFAULT '#10b981';