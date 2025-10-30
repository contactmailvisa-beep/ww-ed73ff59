-- Create profile_views table to track unique views
CREATE TABLE IF NOT EXISTS public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profile_projects(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(profile_id, viewer_id)
);

-- Enable RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Allow profile owners to view all views on their profiles
CREATE POLICY "Profile owners can view their profile views"
ON public.profile_views
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profile_projects
    WHERE profile_projects.id = profile_views.profile_id
    AND profile_projects.user_id = auth.uid()
  )
);

-- Allow authenticated users to insert views (but unique constraint prevents duplicates)
CREATE POLICY "Authenticated users can record views"
ON public.profile_views
FOR INSERT
WITH CHECK (auth.uid() = viewer_id);

-- Create index for faster lookups
CREATE INDEX idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX idx_profile_views_viewer_id ON public.profile_views(viewer_id);