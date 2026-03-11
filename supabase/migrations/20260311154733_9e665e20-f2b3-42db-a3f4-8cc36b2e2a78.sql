
-- Support tickets table
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  numero text NOT NULL,
  assunto text NOT NULL,
  categoria text NOT NULL,
  descricao_inicial text NOT NULL,
  status text NOT NULL DEFAULT 'aberto',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ticket messages (interactions/history)
CREATE TABLE public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  autor text NOT NULL,
  nome_autor text NOT NULL,
  mensagem text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ticket feedback (one per ticket, via email link)
CREATE TABLE public.ticket_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  rating text NOT NULL CHECK (rating IN ('positive', 'negative')),
  feedback_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX idx_ticket_feedback_token ON public.ticket_feedback(feedback_token);

-- Auto-update updated_at on support_tickets
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_feedback ENABLE ROW LEVEL SECURITY;

-- RLS: support_tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tickets" ON public.support_tickets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets" ON public.support_tickets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS: ticket_messages (users see messages of their tickets)
CREATE POLICY "Users can view messages of own tickets" ON public.ticket_messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert messages on own tickets" ON public.ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()));

-- RLS: ticket_feedback (users see feedback of their tickets)
CREATE POLICY "Users can view feedback of own tickets" ON public.ticket_feedback
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Service role can insert feedback (via edge function)
CREATE POLICY "Service can insert feedback" ON public.ticket_feedback
  FOR INSERT TO service_role WITH CHECK (true);

-- Service role policies for edge functions
CREATE POLICY "Service can select tickets" ON public.support_tickets
  FOR SELECT TO service_role USING (true);

CREATE POLICY "Service can update tickets" ON public.support_tickets
  FOR UPDATE TO service_role USING (true);

CREATE POLICY "Service can insert feedback token" ON public.ticket_feedback
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
