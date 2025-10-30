-- Create profile comments table
CREATE TABLE public.profile_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profile_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.profile_comments(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  hearts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create comment likes/dislikes table
CREATE TABLE public.comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.profile_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Create comment hearts table
CREATE TABLE public.comment_hearts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.profile_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.profile_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_hearts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_comments
CREATE POLICY "Anyone can view comments"
  ON public.profile_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.profile_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.profile_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Profile owners can update any comment on their profile"
  ON public.profile_comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_projects
      WHERE profile_projects.id = profile_comments.profile_id
      AND profile_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own comments"
  ON public.profile_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Profile owners can delete any comment on their profile"
  ON public.profile_comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_projects
      WHERE profile_projects.id = profile_comments.profile_id
      AND profile_projects.user_id = auth.uid()
    )
  );

-- RLS Policies for comment_reactions
CREATE POLICY "Anyone can view reactions"
  ON public.comment_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add reactions"
  ON public.comment_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON public.comment_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for comment_hearts
CREATE POLICY "Anyone can view hearts"
  ON public.comment_hearts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add hearts"
  ON public.comment_hearts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own hearts"
  ON public.comment_hearts FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_profile_comments_updated_at
  BEFORE UPDATE ON public.profile_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_profile_comments_profile_id ON public.profile_comments(profile_id);
CREATE INDEX idx_profile_comments_parent_id ON public.profile_comments(parent_id);
CREATE INDEX idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);
CREATE INDEX idx_comment_hearts_comment_id ON public.comment_hearts(comment_id);