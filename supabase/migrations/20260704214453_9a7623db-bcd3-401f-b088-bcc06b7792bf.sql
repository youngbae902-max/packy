-- Home sections managed by admin
CREATE TABLE public.home_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.home_sections TO anon, authenticated;
GRANT ALL ON public.home_sections TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.home_sections TO authenticated;

ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active home sections"
  ON public.home_sections FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert home sections"
  ON public.home_sections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update home sections"
  ON public.home_sections FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete home sections"
  ON public.home_sections FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE TRIGGER trg_home_sections_updated
  BEFORE UPDATE ON public.home_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pivot table: packs inside a section
CREATE TABLE public.home_section_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.home_sections(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (section_id, pack_id)
);

GRANT SELECT ON public.home_section_packs TO anon, authenticated;
GRANT ALL ON public.home_section_packs TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.home_section_packs TO authenticated;

ALTER TABLE public.home_section_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view section packs"
  ON public.home_section_packs FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert section packs"
  ON public.home_section_packs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update section packs"
  ON public.home_section_packs FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete section packs"
  ON public.home_section_packs FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE INDEX idx_home_section_packs_section ON public.home_section_packs(section_id, display_order);