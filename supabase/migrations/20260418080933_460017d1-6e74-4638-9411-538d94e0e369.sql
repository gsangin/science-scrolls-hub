
-- 1. Role enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3. Policies on user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Lock down author_settings to admins only for writes
DROP POLICY IF EXISTS "Authenticated users can insert author settings" ON public.author_settings;
DROP POLICY IF EXISTS "Authenticated users can update author settings" ON public.author_settings;

CREATE POLICY "Admins can insert author settings"
ON public.author_settings FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update author settings"
ON public.author_settings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Restrict comments DELETE to admins
DROP POLICY IF EXISTS "Authenticated users can delete comments" ON public.comments;

CREATE POLICY "Admins can delete comments"
ON public.comments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Restrict resources writes to admins (still enforce ownership for traceability)
DROP POLICY IF EXISTS "Authenticated users can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Users can update their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can delete their own resources" ON public.resources;

CREATE POLICY "Admins can insert resources"
ON public.resources FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

CREATE POLICY "Admins can update resources"
ON public.resources FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resources"
ON public.resources FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Restrict storage object writes to admins (study-materials and author-photos)
DROP POLICY IF EXISTS "Authenticated users can delete author photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update author photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload author photos" ON storage.objects;

CREATE POLICY "Admins can upload author photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'author-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update author photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'author-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete author photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'author-photos' AND public.has_role(auth.uid(), 'admin'));

-- Study materials: restrict writes to admins (keep public SELECT via existing policies)
DROP POLICY IF EXISTS "Authenticated users can upload study materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update study materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete study materials" ON storage.objects;

CREATE POLICY "Admins can upload study materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'study-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update study materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'study-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete study materials"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'study-materials' AND public.has_role(auth.uid(), 'admin'));
