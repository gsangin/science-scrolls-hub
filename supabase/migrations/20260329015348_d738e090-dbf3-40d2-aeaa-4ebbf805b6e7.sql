CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  class_level text NOT NULL,
  message text NOT NULL,
  author_name text NOT NULL DEFAULT 'Anonymous',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by everyone" ON public.comments
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert comments" ON public.comments
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comments" ON public.comments
  FOR DELETE TO authenticated USING (true);