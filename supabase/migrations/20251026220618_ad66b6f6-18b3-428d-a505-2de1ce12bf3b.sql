-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true);

-- Allow users to upload files to their own discord_id folder
CREATE POLICY "Users can upload to their folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1] = (
    SELECT discord_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Allow users to update files in their own discord_id folder
CREATE POLICY "Users can update their files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1] = (
    SELECT discord_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Allow users to delete files in their own discord_id folder
CREATE POLICY "Users can delete their files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1] = (
    SELECT discord_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Allow public read access for running projects
CREATE POLICY "Public can view files from running projects"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'project-files'
);