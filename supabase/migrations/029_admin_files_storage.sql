-- Migration: Admin Files Storage
-- Creates storage bucket for business invoices and admin files

-- Create storage bucket for admin files (if not exists via API, run this in SQL)
-- Note: Storage buckets are typically created via the Supabase dashboard or API
-- This SQL approach uses raw insert which may not work on all Supabase versions

-- Alternative: Create via Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create new bucket named "admin-files"
-- 3. Set to Public (for easy PDF viewing)
-- 4. Under Policies, add:
--    - SELECT: Allow authenticated users
--    - INSERT: Allow authenticated users  
--    - UPDATE: Allow authenticated users
--    - DELETE: Allow authenticated users

-- If bucket doesn't exist, create via Dashboard or API
-- The following is a reminder of what policies to set:

/*
-- Policy: Allow service role full access
CREATE POLICY "Service role has full access"
ON storage.objects
FOR ALL
USING (bucket_id = 'admin-files')
WITH CHECK (bucket_id = 'admin-files');

-- Policy: Allow public read access
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'admin-files');
*/

SELECT 'Admin files storage bucket migration - see comments for setup instructions' as result;
