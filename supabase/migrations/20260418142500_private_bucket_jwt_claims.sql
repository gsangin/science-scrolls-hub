-- ============================================================
-- Fix #1: Make study-materials bucket PRIVATE + drop public SELECT
-- ============================================================

-- Make the bucket private (no anonymous access via public URL)
UPDATE storage.buckets
SET public = false
WHERE id = 'study-materials';

-- Drop the old public SELECT policy so anon can no longer read objects
DROP POLICY IF EXISTS "Study materials are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own study materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own study materials" ON storage.objects;

-- Authenticated users can still read (needed for signed URL generation via service role)
-- The edge function uses the service_role key, so no storage policy is needed for it.
-- Admins can still read for management purposes.
CREATE POLICY "Admins can read study materials"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'study-materials' AND public.has_role(auth.uid(), 'admin'));


-- ============================================================
-- Fix #2: JWT custom claims for roles
-- ============================================================

-- 1. Create the custom access token hook function
--    This runs on every token issue and injects the user's role into the JWT.
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims jsonb;
  user_role public.app_role;
BEGIN
  -- Extract the current claims
  claims := event->'claims';

  -- Look up the user's role
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = (event->>'user_id')::uuid
  LIMIT 1;

  IF user_role IS NOT NULL THEN
    -- Set the claim in app_metadata
    claims := jsonb_set(claims, '{app_metadata,app_role}', to_jsonb(user_role));
  ELSE
    -- Ensure the claim exists but is null (clean state)
    claims := jsonb_set(claims, '{app_metadata,app_role}', '"user"');
  END IF;

  -- Update the event with modified claims
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- 2. Grant necessary permissions for the hook to run
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Grant the auth admin access to read user_roles (needed by the hook)
GRANT SELECT ON public.user_roles TO supabase_auth_admin;

-- Revoke from public/anon for safety
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- 3. Update has_role to read from JWT claims instead of querying the table
--    This eliminates a table lookup on every single RLS policy check.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt()->'app_metadata'->>'app_role')::text = _role::text
    AND auth.uid() = _user_id,
    false
  )
$$;
