-- Categorias
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update categories" ON public.categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete categories" ON public.categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.categories (name, display_order) VALUES
  ('Efeitos', 1), ('Presets essenciais', 2), ('Prateleira premium', 3), ('Lançamentos', 4);

-- Visibilidade de seções do perfil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_favorites_section boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_reposts_section boolean NOT NULL DEFAULT true;

-- Votos de acapella
CREATE TABLE IF NOT EXISTS public.acapella_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acapella_id uuid NOT NULL REFERENCES public.acapellas(id) ON DELETE CASCADE,
  choice text NOT NULL CHECK (char_length(choice) BETWEEN 1 AND 50),
  suggestion text CHECK (suggestion IS NULL OR char_length(suggestion) <= 300),
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS acapella_votes_acapella_id_idx ON public.acapella_votes(acapella_id);
ALTER TABLE public.acapella_votes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.acapella_votes TO anon, authenticated;
DROP POLICY IF EXISTS "Anyone can read acapella votes" ON public.acapella_votes;
CREATE POLICY "Anyone can read acapella votes" ON public.acapella_votes FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can submit acapella votes" ON public.acapella_votes;
CREATE POLICY "Anyone can submit acapella votes" ON public.acapella_votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());