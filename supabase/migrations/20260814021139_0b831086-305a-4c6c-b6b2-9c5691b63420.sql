-- Remove the overly permissive public policy that exposed all columns (including
-- wallet_balance and recovery_keyword) to unauthenticated visitors.
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;

-- Create a public-safe view that exposes only non-sensitive profile columns.
-- security_invoker=off lets the view run with owner privileges, bypassing RLS
-- so anon/authenticated users can read public profiles without inheriting the
-- broad table policy that was removed above.
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = off) AS
SELECT
  id,
  user_id,
  username,
  artist_name,
  avatar_url,
  created_at,
  updated_at,
  username_changes_today,
  last_username_change_date,
  is_banned,
  is_online,
  last_seen,
  has_spotify_badge,
  bio,
  instagram_url,
  spotify_url,
  soundcloud_url,
  youtube_url,
  banner_url,
  status_ring_color,
  thought_bubble,
  theme_preference,
  theme_accent_color,
  online_accent_color,
  theme_mode,
  verified_badge_color,
  admin_badge_color,
  verified_badge_bg_color,
  verified_badge_text_color,
  admin_badge_bg_color,
  admin_badge_border_color,
  admin_badge_text_color,
  show_badges_in_bio,
  show_badges_in_thought,
  profile_decoration_url,
  profile_decoration_position,
  saved_themes,
  show_admin_badge,
  verified_rgb,
  avatar_shape,
  online_indicator_shape,
  verified_badge_text
FROM public.profiles;

-- Grant public read access to the safe view.
GRANT SELECT ON public.profiles_public TO anon;
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO service_role;

-- Defense in depth: ensure sensitive columns on the underlying table are not
-- directly readable by public/authenticated roles.
REVOKE SELECT (wallet_balance, recovery_keyword) ON public.profiles FROM anon;
REVOKE SELECT (wallet_balance, recovery_keyword) ON public.profiles FROM authenticated;