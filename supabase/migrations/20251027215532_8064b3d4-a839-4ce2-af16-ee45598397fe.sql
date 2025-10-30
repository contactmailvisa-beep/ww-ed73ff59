-- Add 'profile' to project_language enum
ALTER TYPE project_language ADD VALUE IF NOT EXISTS 'profile';

-- Create table for profile projects
CREATE TABLE IF NOT EXISTS public.profile_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL UNIQUE,
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  style_type TEXT NOT NULL CHECK (style_type IN ('modern', 'gradient', 'glass', 'neomorphism')),
  avatar_url TEXT,
  background_type TEXT NOT NULL CHECK (background_type IN ('color', 'image')),
  background_value TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Profile',
  description TEXT NOT NULL DEFAULT 'Welcome to my profile',
  buttons JSONB NOT NULL DEFAULT '[]'::jsonb,
  footer_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,}$')
);

-- Enable RLS
ALTER TABLE public.profile_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_projects
CREATE POLICY "Anyone can view profiles"
  ON public.profile_projects
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create own profiles"
  ON public.profile_projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles"
  ON public.profile_projects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles"
  ON public.profile_projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for fast username lookup
CREATE INDEX IF NOT EXISTS idx_profile_projects_username ON public.profile_projects(username);

-- Create trigger for updated_at
CREATE TRIGGER update_profile_projects_updated_at
  BEFORE UPDATE ON public.profile_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for profile assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-assets', 'profile-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile assets
CREATE POLICY "Anyone can view profile assets"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-assets');

CREATE POLICY "Authenticated users can upload profile assets"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'profile-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile assets"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own profile assets"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'profile-assets' AND auth.uid()::text = (storage.foldername(name))[1]);