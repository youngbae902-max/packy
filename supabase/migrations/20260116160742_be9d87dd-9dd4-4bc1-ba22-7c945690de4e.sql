-- Fix function search path for update_pack_likes_count
CREATE OR REPLACE FUNCTION public.update_pack_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.packs SET likes_count = likes_count + 1 WHERE id = NEW.pack_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.packs SET likes_count = likes_count - 1 WHERE id = OLD.pack_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix function search path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;