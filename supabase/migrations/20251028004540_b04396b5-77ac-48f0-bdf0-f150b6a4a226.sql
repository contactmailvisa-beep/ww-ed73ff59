-- Update the check constraint to include all 32 style types
ALTER TABLE profile_projects 
DROP CONSTRAINT IF EXISTS profile_projects_style_type_check;

ALTER TABLE profile_projects 
ADD CONSTRAINT profile_projects_style_type_check 
CHECK (style_type IN ('modern', 'gradient', 'glass', 'neomorphism', 'minimalist', 'neon', 'brutalist', 'retro', 'cosmic', 'paper', 'terminal', 'luxury', 'playful', 'corporate', 'artistic', 'cyberpunk', 'matrix', 'ocean', 'sunset', 'aurora', 'vapor', 'desert', 'forest', 'midnight', 'candy', 'metallic', 'pastel', 'monochrome', 'rainbow', 'galaxy', 'vintage', 'futuristic'));