-- Fix search_path for security
CREATE OR REPLACE FUNCTION public.generate_url_slug(user_discord_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;