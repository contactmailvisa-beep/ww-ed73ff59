-- Add verification fields to profile_projects
ALTER TABLE profile_projects
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS total_views bigint DEFAULT 0;

-- Create function to auto-verify profiles based on views
CREATE OR REPLACE FUNCTION update_profile_verification()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for auto verification
DROP TRIGGER IF EXISTS trigger_update_profile_verification ON profile_projects;
CREATE TRIGGER trigger_update_profile_verification
  BEFORE UPDATE ON profile_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_verification();

-- Create function to update total views count
CREATE OR REPLACE FUNCTION update_profile_total_views()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to update total views on new view
DROP TRIGGER IF EXISTS trigger_update_total_views ON profile_views;
CREATE TRIGGER trigger_update_total_views
  AFTER INSERT ON profile_views
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_total_views();