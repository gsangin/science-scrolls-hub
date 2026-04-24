-- Drop overly broad public SELECT policies on storage.objects that allow listing
DROP POLICY IF EXISTS "Public read access for study-materials" ON storage.objects;
DROP POLICY IF EXISTS "Public can view study-materials" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view study-materials" ON storage.objects;
DROP POLICY IF EXISTS "Study materials are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for author-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view author-photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view author-photos" ON storage.objects;
DROP POLICY IF EXISTS "Author photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list study-materials" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list author-photos" ON storage.objects;

-- Allow admins to list/select files in both buckets (for management UIs)
CREATE POLICY "Admins can list study-materials"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'study-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can list author-photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'author-photos' AND public.has_role(auth.uid(), 'admin'));
