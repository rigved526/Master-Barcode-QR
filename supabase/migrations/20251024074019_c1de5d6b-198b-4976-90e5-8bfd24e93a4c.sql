-- Create tickets table
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code text UNIQUE NOT NULL,
  attendee_name text NOT NULL,
  email text NOT NULL,
  ticket_type text NOT NULL,
  event_name text NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create check_ins table
CREATE TABLE public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE,
  ticket_code text NOT NULL,
  checked_in_at timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('valid', 'invalid', 'duplicate')),
  attendee_name text,
  UNIQUE(ticket_id)
);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Public read access (for scanning and dashboard)
CREATE POLICY "Anyone can view tickets"
  ON public.tickets FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view check-ins"
  ON public.check_ins FOR SELECT
  USING (true);

-- Public insert for check-ins (when scanning)
CREATE POLICY "Anyone can create check-ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (true);

-- Public insert for tickets (for demo purposes)
CREATE POLICY "Anyone can create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (true);

-- Enable realtime for check_ins
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_ins;

-- Create index for faster lookups
CREATE INDEX idx_tickets_ticket_code ON public.tickets(ticket_code);
CREATE INDEX idx_check_ins_ticket_id ON public.check_ins(ticket_id);