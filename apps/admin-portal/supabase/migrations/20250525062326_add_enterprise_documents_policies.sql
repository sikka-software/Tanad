-- Allow authenticated users to upload documents
CREATE POLICY "authenticated_upload_enterprise_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'enterprise-documents');

-- Allow authenticated users to read documents
CREATE POLICY "authenticated_read_enterprise_documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'enterprise-documents');

-- Allow authenticated users to delete documents
CREATE POLICY "authenticated_delete_enterprise_documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'enterprise-documents');
