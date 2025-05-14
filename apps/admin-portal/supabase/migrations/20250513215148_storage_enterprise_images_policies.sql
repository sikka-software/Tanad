-- Allow authenticated users to upload (insert) and update their own images in the 'enterprise-images' bucket
CREATE POLICY "Allow authenticated upload to enterprise-images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'enterprise-images');

CREATE POLICY "Allow authenticated update to enterprise-images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'enterprise-images')
  WITH CHECK (bucket_id = 'enterprise-images');

-- Allow anyone (public) to select (view) images in the 'enterprise-images' bucket
CREATE POLICY "Allow public read on enterprise-images" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'enterprise-images');
