-- Add file modifications tracking table
CREATE TABLE IF NOT EXISTS public.file_modifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  file_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  modification_type TEXT NOT NULL CHECK (modification_type IN ('created', 'updated', 'deleted', 'renamed')),
  old_content TEXT,
  new_content TEXT,
  old_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.file_modifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own project modifications"
ON public.file_modifications
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects
  WHERE projects.id = file_modifications.project_id
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can insert own project modifications"
ON public.file_modifications
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projects
  WHERE projects.id = file_modifications.project_id
  AND projects.user_id = auth.uid()
));

-- Add index for better performance
CREATE INDEX idx_file_modifications_project_id ON public.file_modifications(project_id);
CREATE INDEX idx_file_modifications_created_at ON public.file_modifications(created_at DESC);