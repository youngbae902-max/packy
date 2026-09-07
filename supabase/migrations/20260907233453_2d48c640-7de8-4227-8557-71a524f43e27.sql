ALTER TABLE public.packs ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Anyone can view approved packs" ON public.packs;
CREATE POLICY "Anyone can view approved packs"
ON public.packs
FOR SELECT
USING (status = 'approved'::pack_status AND is_private = false);