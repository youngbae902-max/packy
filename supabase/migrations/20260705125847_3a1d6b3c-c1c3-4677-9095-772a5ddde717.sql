
-- Add text customization column for verified badge
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_badge_text TEXT DEFAULT 'Verificado';

-- Ensure grants on home_sections tables (were missing, blocked API access)
GRANT SELECT ON public.home_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_sections TO authenticated;
GRANT ALL ON public.home_sections TO service_role;

GRANT SELECT ON public.home_section_packs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_section_packs TO authenticated;
GRANT ALL ON public.home_section_packs TO service_role;
