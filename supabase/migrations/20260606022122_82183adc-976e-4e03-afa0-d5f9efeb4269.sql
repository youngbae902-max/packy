
-- 1) user_beats table (private library)
CREATE TABLE public.user_beats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cover_url TEXT,
  external_url TEXT,
  storage_path TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_beats_has_source CHECK (external_url IS NOT NULL OR storage_path IS NOT NULL)
);

CREATE INDEX user_beats_user_id_idx ON public.user_beats(user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_beats TO authenticated;
GRANT ALL ON public.user_beats TO service_role;

ALTER TABLE public.user_beats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_beats_select_own" ON public.user_beats
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_beats_insert_own" ON public.user_beats
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_beats_update_own" ON public.user_beats
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_beats_delete_own" ON public.user_beats
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER user_beats_updated_at
  BEFORE UPDATE ON public.user_beats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Profile: online indicator shape + drop template fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS online_indicator_shape TEXT NOT NULL DEFAULT 'pill';

ALTER TABLE public.profiles DROP COLUMN IF EXISTS pack_name_prefix;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS pack_name_emoji;

-- 3) Packs: manual order + trending score
ALTER TABLE public.packs
  ADD COLUMN IF NOT EXISTS manual_order INTEGER,
  ADD COLUMN IF NOT EXISTS trending_score NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trending_score_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS packs_explore_order_idx
  ON public.packs (is_pinned DESC, trending_score DESC, manual_order NULLS LAST, created_at DESC);

-- 4) Trending recompute function (score = downloads*3 + likes*2 + comments*1 from last 14 days)
CREATE OR REPLACE FUNCTION public.recompute_trending_scores()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected INTEGER := 0;
BEGIN
  WITH d AS (
    SELECT pack_id, COUNT(*) AS c FROM public.pack_downloads
      WHERE downloaded_at > now() - interval '14 days' GROUP BY pack_id
  ), l AS (
    SELECT pack_id, COUNT(*) AS c FROM public.pack_likes
      WHERE created_at > now() - interval '14 days' GROUP BY pack_id
  ), c AS (
    SELECT pack_id, COUNT(*) AS c FROM public.pack_comments
      WHERE created_at > now() - interval '14 days' GROUP BY pack_id
  )
  UPDATE public.packs p
  SET trending_score = COALESCE(d.c,0)*3 + COALESCE(l.c,0)*2 + COALESCE(c.c,0),
      trending_score_updated_at = now()
  FROM (
    SELECT id FROM public.packs WHERE status = 'approved'
  ) ap
  LEFT JOIN d ON d.pack_id = ap.id
  LEFT JOIN l ON l.pack_id = ap.id
  LEFT JOIN c ON c.pack_id = ap.id
  WHERE p.id = ap.id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END; $$;

GRANT EXECUTE ON FUNCTION public.recompute_trending_scores() TO authenticated;

-- 5) Admin: bulk update pack ordering
CREATE OR REPLACE FUNCTION public.admin_set_pack_order(pack_id_in UUID, new_order INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN RETURN false; END IF;
  UPDATE public.packs SET manual_order = new_order, updated_at = now() WHERE id = pack_id_in;
  RETURN FOUND;
END; $$;

GRANT EXECUTE ON FUNCTION public.admin_set_pack_order(UUID, INTEGER) TO authenticated;
