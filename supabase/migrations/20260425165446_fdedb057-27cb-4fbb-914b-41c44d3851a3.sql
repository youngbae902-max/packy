CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT user_follows_no_self_follow CHECK (follower_id <> following_id),
  UNIQUE (follower_id, following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows"
ON public.user_follows
FOR SELECT
USING (true);

CREATE POLICY "Users can follow as themselves"
ON public.user_follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow as themselves"
ON public.user_follows
FOR DELETE
USING (auth.uid() = follower_id OR is_admin());

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

CREATE TABLE IF NOT EXISTS public.pack_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pack_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pack comments"
ON public.pack_comments
FOR SELECT
USING (true);

CREATE POLICY "Users can create own comments"
ON public.pack_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit own comments"
ON public.pack_comments
FOR UPDATE
USING (auth.uid() = user_id OR is_admin())
WITH CHECK ((auth.uid() = user_id AND is_pinned = false) OR is_admin());

CREATE POLICY "Users and admins can delete comments"
ON public.pack_comments
FOR DELETE
USING (auth.uid() = user_id OR is_admin());

CREATE INDEX IF NOT EXISTS idx_pack_comments_pack ON public.pack_comments(pack_id, is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pack_comments_user ON public.pack_comments(user_id);

CREATE TRIGGER update_pack_comments_updated_at
BEFORE UPDATE ON public.pack_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.pack_reposts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (pack_id, user_id)
);

ALTER TABLE public.pack_reposts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reposts"
ON public.pack_reposts
FOR SELECT
USING (true);

CREATE POLICY "Users can repost as themselves"
ON public.pack_reposts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reposts"
ON public.pack_reposts
FOR DELETE
USING (auth.uid() = user_id OR is_admin());

CREATE INDEX IF NOT EXISTS idx_pack_reposts_pack ON public.pack_reposts(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_reposts_user ON public.pack_reposts(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.notify_pack_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id UUID;
  liker_name TEXT;
  pack_title TEXT;
BEGIN
  SELECT p.user_id, p.title INTO owner_id, pack_title
  FROM public.packs p
  WHERE p.id = NEW.pack_id;

  IF owner_id IS NULL OR owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(pr.username, ''), NULLIF(pr.artist_name, ''), 'Alguém') INTO liker_name
  FROM public.profiles pr
  WHERE pr.user_id = NEW.user_id;

  INSERT INTO public.user_inbox (user_id, type, title, message, pack_id)
  VALUES (owner_id, 'notification', 'Curtiram seu pack', liker_name || ' curtiu seu pack ' || COALESCE(pack_title, ''), NEW.pack_id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_pack_like_trigger ON public.pack_likes;
CREATE TRIGGER notify_pack_like_trigger
AFTER INSERT ON public.pack_likes
FOR EACH ROW
EXECUTE FUNCTION public.notify_pack_like();

CREATE OR REPLACE FUNCTION public.notify_pack_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id UUID;
  commenter_name TEXT;
  pack_title TEXT;
BEGIN
  SELECT p.user_id, p.title INTO owner_id, pack_title
  FROM public.packs p
  WHERE p.id = NEW.pack_id;

  IF owner_id IS NULL OR owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(pr.username, ''), NULLIF(pr.artist_name, ''), 'Alguém') INTO commenter_name
  FROM public.profiles pr
  WHERE pr.user_id = NEW.user_id;

  INSERT INTO public.user_inbox (user_id, type, title, message, pack_id)
  VALUES (owner_id, 'notification', 'Comentaram no seu pack', commenter_name || ' comentou no seu pack ' || COALESCE(pack_title, ''), NEW.pack_id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_pack_comment_trigger ON public.pack_comments;
CREATE TRIGGER notify_pack_comment_trigger
AFTER INSERT ON public.pack_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_pack_comment();

CREATE OR REPLACE FUNCTION public.notify_user_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_name TEXT;
BEGIN
  SELECT COALESCE(NULLIF(pr.username, ''), NULLIF(pr.artist_name, ''), 'Alguém') INTO follower_name
  FROM public.profiles pr
  WHERE pr.user_id = NEW.follower_id;

  INSERT INTO public.user_inbox (user_id, type, title, message, pack_id)
  VALUES (NEW.following_id, 'notification', 'Novo seguidor', follower_name || ' começou a seguir você', NULL);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_user_follow_trigger ON public.user_follows;
CREATE TRIGGER notify_user_follow_trigger
AFTER INSERT ON public.user_follows
FOR EACH ROW
EXECUTE FUNCTION public.notify_user_follow();