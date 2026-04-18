
-- 1. Add CHECK constraints to comments
ALTER TABLE public.comments
  ADD CONSTRAINT comments_message_length CHECK (char_length(message) BETWEEN 1 AND 2000),
  ADD CONSTRAINT comments_author_name_length CHECK (char_length(author_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT comments_subject_valid CHECK (subject IN ('physics', 'chemistry', 'mathematics', 'biology', 'english', 'computer', 'nepali', 'social')),
  ADD CONSTRAINT comments_class_level_valid CHECK (class_level IN ('11', '12', 'eng1', 'eng2'));

-- 2. Replace insert policy with one that explicitly enforces the same checks at the policy level
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;

CREATE POLICY "Anyone can insert valid comments"
ON public.comments FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(message) BETWEEN 1 AND 2000
  AND char_length(author_name) BETWEEN 1 AND 100
  AND subject IN ('physics', 'chemistry', 'mathematics', 'biology', 'english', 'computer', 'nepali', 'social')
  AND class_level IN ('11', '12', 'eng1', 'eng2')
);

-- 3. Explicitly block non-admin INSERT/UPDATE/DELETE on user_roles via a restrictive policy
-- Restrictive policies are AND-ed with permissive ones, so this guarantees only admins can write.
CREATE POLICY "Only admins can write user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
