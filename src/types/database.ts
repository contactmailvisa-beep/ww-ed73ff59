// Local database types until Supabase types are updated
export type ProjectLanguage = 'nodejs' | 'python' | 'typescript' | 'html' | 'profile';
export type ProjectStatus = 'running' | 'stopped' | 'error' | 'starting';
export type ProfileStyleType = 'modern' | 'gradient' | 'glass' | 'neomorphism' | 'minimalist' | 'neon' | 'brutalist' | 'retro' | 'cosmic' | 'paper' | 'terminal' | 'luxury' | 'playful' | 'corporate' | 'artistic' | 'cyberpunk' | 'matrix' | 'ocean' | 'sunset' | 'aurora' | 'vapor' | 'desert' | 'forest' | 'midnight' | 'candy' | 'metallic' | 'pastel' | 'monochrome' | 'rainbow' | 'galaxy' | 'vintage' | 'futuristic';

export interface FileModification {
  id: string;
  project_id: string;
  file_id: string;
  file_name: string;
  file_path: string;
  modification_type: 'created' | 'updated' | 'deleted' | 'renamed';
  old_content: string | null;
  new_content: string | null;
  old_name: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  discord_id: string;
  username: string;
  avatar_url: string | null;
  discriminator: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  language: ProjectLanguage;
  status: ProjectStatus;
  url_slug: string;
  main_file: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  parent_path: string | null;
  content: string | null;
  is_directory: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsoleLog {
  id: string;
  project_id: string;
  log_type: string;
  message: string;
  timestamp: string;
}
