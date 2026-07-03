-- Create Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create Policies for Categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Categories are insertable by admins" ON public.categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.show_admin_badge = true
        ) OR (
            current_setting('request.jwt.claims', true)::json->>'email' = 'youngbae902@gmail.com'
        )
    );

CREATE POLICY "Categories are updatable by admins" ON public.categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.show_admin_badge = true
        ) OR (
            current_setting('request.jwt.claims', true)::json->>'email' = 'youngbae902@gmail.com'
        )
    );

CREATE POLICY "Categories are deletable by admins" ON public.categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.show_admin_badge = true
        ) OR (
            current_setting('request.jwt.claims', true)::json->>'email' = 'youngbae902@gmail.com'
        )
    );

-- Create pack_categories relation table
CREATE TABLE IF NOT EXISTS public.pack_categories (
    pack_id UUID REFERENCES public.packs(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (pack_id, category_id)
);

-- Enable RLS
ALTER TABLE public.pack_categories ENABLE ROW LEVEL SECURITY;

-- Create Policies for pack_categories
CREATE POLICY "Pack categories are viewable by everyone" ON public.pack_categories
    FOR SELECT USING (true);

CREATE POLICY "Pack categories are insertable by users" ON public.pack_categories
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Pack categories are updatable by users" ON public.pack_categories
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Pack categories are deletable by users" ON public.pack_categories
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_categories_updated_at();

-- Insert Default Categories
INSERT INTO public.categories (name, display_order, is_active) VALUES
('Efeitos', 1, true),
('Presets essenciais', 2, true),
('Prateleira premium', 3, true),
('Lançamentos', 4, true)
ON CONFLICT DO NOTHING;
