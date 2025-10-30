-- Drop and recreate generate_url_slug to use discord_id
DROP FUNCTION IF EXISTS public.generate_url_slug(text);

CREATE OR REPLACE FUNCTION public.generate_url_slug(user_discord_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  random_string TEXT;
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 7 character random string (alphanumeric only)
    random_string := array_to_string(
      ARRAY(
        SELECT substr('abcdefghijklmnopqrstuvwxyz0123456789', trunc(random() * 36 + 1)::INTEGER, 1)
        FROM generate_series(1, 7)
      ),
      ''
    );
    
    new_slug := user_discord_id || '/' || random_string;
    
    -- Check if slug exists
    SELECT EXISTS(SELECT 1 FROM public.projects WHERE url_slug = new_slug) INTO slug_exists;
    
    EXIT WHEN NOT slug_exists;
  END LOOP;
  
  RETURN new_slug;
END;
$$;

-- Remove port column from projects
ALTER TABLE public.projects DROP COLUMN IF EXISTS port;

-- Add cascade delete from projects to file_modifications
ALTER TABLE public.file_modifications 
DROP CONSTRAINT IF EXISTS file_modifications_project_id_fkey;

ALTER TABLE public.file_modifications
ADD CONSTRAINT file_modifications_project_id_fkey 
FOREIGN KEY (project_id) 
REFERENCES public.projects(id) 
ON DELETE CASCADE;