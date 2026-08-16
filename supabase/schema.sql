-- ============================================================
-- EGGLESS BAKER — Supabase Schema, Admin Authorization & RLS Policies
-- ============================================================

-- 1. ADMIN USERS TABLE & HELPER FUNCTION
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admin users to read their own record to verify admin status in frontend
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Helper function to check if the current user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;


-- 2. ENQUIRIES TABLE RLS
-- ------------------------------------------------------------
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Anonymous + Authenticated public can submit contact forms
DROP POLICY IF EXISTS "Public can insert enquiries" ON public.enquiries;
CREATE POLICY "Public can insert enquiries"
  ON public.enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ONLY authorized admins can read enquiries
DROP POLICY IF EXISTS "Admins can view enquiries" ON public.enquiries;
CREATE POLICY "Admins can view enquiries"
  ON public.enquiries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ONLY authorized admins can update enquiries (status, notes, replied_at)
DROP POLICY IF EXISTS "Admins can update enquiries" ON public.enquiries;
CREATE POLICY "Admins can update enquiries"
  ON public.enquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ONLY authorized admins can delete enquiries
DROP POLICY IF EXISTS "Admins can delete enquiries" ON public.enquiries;
CREATE POLICY "Admins can delete enquiries"
  ON public.enquiries
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- 3. CAKE PHOTOS TABLE RLS
-- ------------------------------------------------------------
ALTER TABLE public.cake_photos ENABLE ROW LEVEL SECURITY;

-- Public can view visible cakes, admins can view all (including hidden)
DROP POLICY IF EXISTS "Public can view visible cakes" ON public.cake_photos;
CREATE POLICY "Public can view visible cakes"
  ON public.cake_photos
  FOR SELECT
  TO anon, authenticated
  USING (is_visible = true OR public.is_admin());

-- ONLY authorized admins can insert cake photos
DROP POLICY IF EXISTS "Admins can insert cake photos" ON public.cake_photos;
CREATE POLICY "Admins can insert cake photos"
  ON public.cake_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- ONLY authorized admins can update cake photos (reorder, visibility, tags)
DROP POLICY IF EXISTS "Admins can update cake photos" ON public.cake_photos;
CREATE POLICY "Admins can update cake photos"
  ON public.cake_photos
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ONLY authorized admins can delete cake photos
DROP POLICY IF EXISTS "Admins can delete cake photos" ON public.cake_photos;
CREATE POLICY "Admins can delete cake photos"
  ON public.cake_photos
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- 4. BUSINESS SETTINGS TABLE RLS
-- ------------------------------------------------------------
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Public can read business settings
DROP POLICY IF EXISTS "Public can read business settings" ON public.business_settings;
CREATE POLICY "Public can read business settings"
  ON public.business_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ONLY authorized admins can update business settings
DROP POLICY IF EXISTS "Admins can update business settings" ON public.business_settings;
CREATE POLICY "Admins can update business settings"
  ON public.business_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ONLY authorized admins can insert business settings
DROP POLICY IF EXISTS "Admins can insert business settings" ON public.business_settings;
CREATE POLICY "Admins can insert business settings"
  ON public.business_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());


-- 5. STORAGE BUCKET 'cake-photos' RLS
-- ------------------------------------------------------------
-- Ensure the bucket exists and is public for image reads
INSERT INTO storage.buckets (id, name, public)
VALUES ('cake-photos', 'cake-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read access for cake images
DROP POLICY IF EXISTS "Public can view cake photos" ON storage.objects;
CREATE POLICY "Public can view cake photos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'cake-photos');

-- Admin upload access
DROP POLICY IF EXISTS "Admins can upload cake photos" ON storage.objects;
CREATE POLICY "Admins can upload cake photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cake-photos' AND public.is_admin());

-- Admin update access
DROP POLICY IF EXISTS "Admins can update cake photos" ON storage.objects;
CREATE POLICY "Admins can update cake photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'cake-photos' AND public.is_admin());

-- Admin delete access
DROP POLICY IF EXISTS "Admins can delete cake photos" ON storage.objects;
CREATE POLICY "Admins can delete cake photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'cake-photos' AND public.is_admin());
