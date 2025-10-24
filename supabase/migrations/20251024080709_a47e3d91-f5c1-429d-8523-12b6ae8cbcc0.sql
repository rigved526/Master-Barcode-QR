-- Remove unnecessary columns from tickets table
ALTER TABLE public.tickets 
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS ticket_type,
DROP COLUMN IF EXISTS purchased_at,
DROP COLUMN IF EXISTS created_at;

-- tickets table now only has: id, ticket_code, attendee_name, event_name