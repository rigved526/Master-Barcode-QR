-- Add checked_in_at column to tickets table
ALTER TABLE public.tickets 
ADD COLUMN checked_in_at timestamp with time zone;

-- Drop the check_ins table as it's no longer needed
DROP TABLE IF EXISTS public.check_ins;

-- Update RLS policies for tickets to allow updates
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Anyone can view tickets" ON public.tickets;

CREATE POLICY "Anyone can view tickets" 
ON public.tickets 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create tickets" 
ON public.tickets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update tickets" 
ON public.tickets 
FOR UPDATE 
USING (true);