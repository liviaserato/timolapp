
-- Drop the old CHECK and add one that also allows 'pending'
ALTER TABLE public.ticket_feedback DROP CONSTRAINT ticket_feedback_rating_check;
ALTER TABLE public.ticket_feedback ADD CONSTRAINT ticket_feedback_rating_check CHECK (rating IN ('positive', 'negative', 'pending'));
