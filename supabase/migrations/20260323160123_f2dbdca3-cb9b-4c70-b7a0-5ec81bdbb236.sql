
-- Create storage bucket for author photos (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('author-photos', 'author-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for author photos
CREATE POLICY "Anyone can view author photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'author-photos');

CREATE POLICY "Authenticated users can upload author photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'author-photos');

CREATE POLICY "Authenticated users can update author photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'author-photos');

CREATE POLICY "Authenticated users can delete author photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'author-photos');
