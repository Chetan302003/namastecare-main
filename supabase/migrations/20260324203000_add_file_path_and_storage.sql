-- Add file_path column to health_records
ALTER TABLE public.health_records ADD COLUMN file_path TEXT;

-- Create storage bucket for health reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('health-reports', 'health-reports', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
-- Allow users to upload their own health reports
CREATE POLICY "Users can upload their own health reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'health-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to view their own health reports
CREATE POLICY "Users can view their own health reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'health-reports' AND (storage.foldername(name))[1] = auth.uid()::text);
