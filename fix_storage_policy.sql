-- Ensure (or update) the bucket to be public
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Staff Full Access" ON storage.objects;

-- Allow public access to view photos (GET)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'member-photos' );

-- Allow authenticated users FULL access (Upload, Update, Delete)
CREATE POLICY "Staff Full Access"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'member-photos' )
WITH CHECK ( bucket_id = 'member-photos' );
