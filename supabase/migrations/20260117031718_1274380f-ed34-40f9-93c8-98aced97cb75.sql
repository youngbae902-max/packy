-- Add status to acapellas table for approval workflow
ALTER TABLE public.acapellas 
ADD COLUMN status pack_status DEFAULT 'pending'::pack_status;

-- Update existing acapellas to approved (they were already visible)
UPDATE public.acapellas SET status = 'approved' WHERE status IS NULL;

-- Make status NOT NULL after setting defaults
ALTER TABLE public.acapellas 
ALTER COLUMN status SET NOT NULL;

-- Drop existing RLS policies for acapellas
DROP POLICY IF EXISTS "Admins can manage acapellas" ON public.acapellas;
DROP POLICY IF EXISTS "Anyone can view acapellas" ON public.acapellas;

-- Create new RLS policies for acapellas
CREATE POLICY "Anyone can view approved acapellas" 
ON public.acapellas 
FOR SELECT 
USING (status = 'approved'::pack_status);

CREATE POLICY "Admins can view all acapellas" 
ON public.acapellas 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can insert acapellas" 
ON public.acapellas 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update acapellas" 
ON public.acapellas 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete acapellas" 
ON public.acapellas 
FOR DELETE 
USING (is_admin());