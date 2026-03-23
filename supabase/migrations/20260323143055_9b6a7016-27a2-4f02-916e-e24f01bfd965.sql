-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL CHECK (class_level IN ('11', '12')),
  type TEXT NOT NULL CHECK (type IN ('notes', 'textbook')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Anyone can view resources (public read)
CREATE POLICY "Resources are viewable by everyone"
  ON public.resources FOR SELECT USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert resources"
  ON public.resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only owner can update
CREATE POLICY "Users can update their own resources"
  ON public.resources FOR UPDATE
  USING (auth.uid() = user_id);

-- Only owner can delete
CREATE POLICY "Users can delete their own resources"
  ON public.resources FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for study materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true);

-- Anyone can view/download files
CREATE POLICY "Study materials are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'study-materials');

-- Only authenticated users can upload
CREATE POLICY "Authenticated users can upload study materials"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'study-materials' AND auth.uid() IS NOT NULL);

-- Only owner can update their uploads
CREATE POLICY "Users can update their own study materials"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Only owner can delete their uploads
CREATE POLICY "Users can delete their own study materials"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);