-- ============================================================
-- Africa of Hope — Storage Buckets
-- Run AFTER enabling Storage in your Supabase project
-- Supabase Dashboard → Storage → Create bucket
-- OR run this SQL directly
-- ============================================================

-- ─── Buckets ─────────────────────────────────────────────────

-- Course materials (PDFs, slides, documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  false,
  52428800,  -- 50 MB
  ARRAY['application/pdf', 'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Media / gallery images (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-gallery',
  'media-gallery',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- User avatars (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ─── Storage RLS Policies ────────────────────────────────────

-- course-materials: only authenticated users can read; only service_role can write
CREATE POLICY "auth_read_materials"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'course-materials');

CREATE POLICY "service_write_materials"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'course-materials');

CREATE POLICY "service_delete_materials"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'course-materials');

-- media-gallery: public read; service_role can manage
CREATE POLICY "public_read_gallery"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media-gallery');

CREATE POLICY "service_write_gallery"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'media-gallery')
  WITH CHECK (bucket_id = 'media-gallery');

-- avatars: public read; owner can upload their own
CREATE POLICY "public_read_avatars"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "authenticated_upload_avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
