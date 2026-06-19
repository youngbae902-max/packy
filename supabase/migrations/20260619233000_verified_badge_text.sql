-- Adiciona a coluna para o texto customizado do selo verificado
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verified_badge_text TEXT DEFAULT 'Verificado';
