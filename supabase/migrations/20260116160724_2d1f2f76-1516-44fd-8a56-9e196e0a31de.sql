-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.pack_type AS ENUM ('samples', 'presets', 'drumkit', 'loops', 'project', 'other');
CREATE TYPE public.pack_status AS ENUM ('pending', 'approved', 'rejected');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT,
  artist_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create packs table
CREATE TABLE public.packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  author_name TEXT,
  pack_type pack_type DEFAULT 'other',
  download_url TEXT NOT NULL,
  cover_url TEXT,
  credit_channel_url TEXT,
  is_exclusive BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_admin_pack BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  status pack_status DEFAULT 'pending',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pack_likes table
CREATE TABLE public.pack_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pack_id UUID REFERENCES public.packs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, pack_id)
);

-- Create pack_favorites table
CREATE TABLE public.pack_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pack_id UUID REFERENCES public.packs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, pack_id)
);

-- Create pack_downloads table (tracks unlocked downloads via credit)
CREATE TABLE public.pack_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pack_id UUID REFERENCES public.packs(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, pack_id)
);

-- Create acapellas table (MCs tab - admin only)
CREATE TABLE public.acapellas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  download_url TEXT NOT NULL,
  duration_seconds INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acapellas ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

-- RLS Policies for profiles (private - only own profile)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for packs
CREATE POLICY "Anyone can view approved packs" ON public.packs
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can view all packs" ON public.packs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can view own packs" ON public.packs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert packs" ON public.packs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own packs" ON public.packs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any pack" ON public.packs
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Users can delete own packs" ON public.packs
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any pack" ON public.packs
  FOR DELETE USING (public.is_admin());

-- RLS Policies for pack_likes
CREATE POLICY "Anyone can view likes" ON public.pack_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON public.pack_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own likes" ON public.pack_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for pack_favorites
CREATE POLICY "Users can view own favorites" ON public.pack_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON public.pack_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites" ON public.pack_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for pack_downloads
CREATE POLICY "Users can view own downloads" ON public.pack_downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock downloads" ON public.pack_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for acapellas
CREATE POLICY "Anyone can view acapellas" ON public.acapellas
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage acapellas" ON public.acapellas
  FOR ALL USING (public.is_admin());

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packs_updated_at
  BEFORE UPDATE ON public.packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to promote user to admin (only works for authorized email)
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email TEXT, admin_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Only allow specific email and password
  IF user_email != 'youngbae902@gmail.com' OR admin_password != '55271505@Ma' THEN
    RETURN false;
  END IF;
  
  -- Get user_id from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Add admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Function to update likes count
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

CREATE TRIGGER on_pack_like_change
  AFTER INSERT OR DELETE ON public.pack_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_pack_likes_count();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('acapellas', 'acapellas', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for covers
CREATE POLICY "Cover images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for acapellas
CREATE POLICY "Acapella files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'acapellas');

CREATE POLICY "Admins can upload acapellas" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'acapellas' AND public.is_admin());

CREATE POLICY "Admins can delete acapellas" ON storage.objects
  FOR DELETE USING (bucket_id = 'acapellas' AND public.is_admin());