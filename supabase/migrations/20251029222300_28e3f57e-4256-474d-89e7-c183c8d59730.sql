-- Fix security issues: Set search_path for functions

-- Recreate update_profile_verification function with security definer and search_path
CREATE OR REPLACE FUNCTION update_profile_verification()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto verify if total_views >= 5000
  IF NEW.total_views >= 5000 AND (OLD.is_verified = false OR OLD.is_verified IS NULL) THEN
    NEW.is_verified = true;
    NEW.verified_at = now();
  END IF;
  
  -- Random verification for 100-1000 views (10% chance)
  IF NEW.total_views >= 100 AND NEW.total_views < 1000 AND (OLD.is_verified = false OR OLD.is_verified IS NULL) THEN
    IF random() < 0.1 THEN
      NEW.is_verified = true;
      NEW.verified_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate update_profile_total_views function with security definer and search_path
CREATE OR REPLACE FUNCTION update_profile_total_views()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profile_projects
  SET total_views = (
    SELECT COUNT(DISTINCT viewer_id)
    FROM profile_views
    WHERE profile_id = NEW.profile_id
  )
  WHERE id = NEW.profile_id;
  
  RETURN NEW;
END;
$$;