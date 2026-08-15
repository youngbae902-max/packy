-- 1) Column-level protection for sensitive profile fields
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, user_id, username, artist_name, avatar_url, created_at, updated_at, username_changes_today, last_username_change_date, is_banned, is_online, last_seen, has_spotify_badge, bio, instagram_url, spotify_url, soundcloud_url, youtube_url, banner_url, status_ring_color, thought_bubble, theme_preference, theme_accent_color, online_accent_color, theme_mode, verified_badge_color, admin_badge_color, verified_badge_bg_color, verified_badge_text_color, admin_badge_bg_color, admin_badge_border_color, admin_badge_text_color, show_badges_in_bio, show_badges_in_thought, profile_decoration_url, profile_decoration_position, saved_themes, show_admin_badge, verified_rgb, avatar_shape, online_indicator_shape, verified_badge_text)
ON public.profiles TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

-- 2) Fix SECURITY DEFINER view finding
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT id, user_id, username, artist_name, avatar_url, created_at, updated_at,
       is_banned, is_online, last_seen, has_spotify_badge, bio,
       instagram_url, spotify_url, soundcloud_url, youtube_url, banner_url,
       status_ring_color, thought_bubble, theme_accent_color, online_accent_color,
       verified_badge_color, admin_badge_color, verified_badge_bg_color,
       verified_badge_text_color, admin_badge_bg_color, admin_badge_border_color,
       admin_badge_text_color, show_badges_in_bio, show_badges_in_thought,
       profile_decoration_url, profile_decoration_position, show_admin_badge,
       verified_rgb, avatar_shape, online_indicator_shape, verified_badge_text
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;
GRANT ALL ON public.profiles_public TO service_role;

-- 3) Home banners
CREATE TABLE IF NOT EXISTS public.home_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  subtitle text,
  link_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.home_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_banners TO authenticated;
GRANT ALL ON public.home_banners TO service_role;

ALTER TABLE public.home_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners"
ON public.home_banners FOR SELECT
TO anon, authenticated
USING (is_active OR public.is_admin());

CREATE POLICY "Admins manage banners"
ON public.home_banners FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE TRIGGER trg_home_banners_updated
BEFORE UPDATE ON public.home_banners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();