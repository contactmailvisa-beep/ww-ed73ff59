import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import { Comment } from "./Comment";
import { Link } from "react-router-dom";

interface ProfileCommentsProps {
  profileId: string;
  isOwner: boolean;
  isVisible: boolean;
  onClose: () => void;
}

interface CommentData {
  id: string;
  profile_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  is_pinned: boolean;
  is_edited: boolean;
  likes_count: number;
  dislikes_count: number;
  hearts_count: number;
  created_at: string;
  updated_at: string;
  user_avatar?: string;
  user_name?: string;
}

export const ProfileComments = ({ profileId, isOwner, isVisible, onClose }: ProfileCommentsProps) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    loadComments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`profile-comments:${profileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_comments',
          filter: `profile_id=eq.${profileId}`
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadComments = async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from("profile_comments")
        .select("*")
        .eq("profile_id", profileId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Load user data for each comment from profiles table
      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      
      const usersMap = new Map();
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);

        profiles?.forEach((profile) => {
          usersMap.set(profile.id, {
            avatar: profile.avatar_url,
            name: profile.username
          });
        });
      }

      const enrichedComments = commentsData?.map(comment => ({
        ...comment,
        user_avatar: usersMap.get(comment.user_id)?.avatar,
        user_name: usersMap.get(comment.user_id)?.name || "مستخدم"
      })) || [];

      setComments(enrichedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setSubmitting(true);

    // Get user profile data
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();

    // Create optimistic comment
    const optimisticComment: CommentData = {
      id: `temp-${Date.now()}`,
      profile_id: profileId,
      user_id: user.id,
      content: newComment.trim(),
      parent_id: replyingTo,
      is_pinned: false,
      is_edited: false,
      likes_count: 0,
      dislikes_count: 0,
      hearts_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_avatar: userProfile?.avatar_url,
      user_name: userProfile?.username || "مستخدم"
    };

    // Add optimistic comment immediately to UI
    setComments(prev => [optimisticComment, ...prev]);
    setNewComment("");
    const tempReplyingTo = replyingTo;
    setReplyingTo(null);

    try {
      const { data, error } = await supabase
        .from("profile_comments")
        .insert({
          profile_id: profileId,
          user_id: user.id,
          content: optimisticComment.content,
          parent_id: tempReplyingTo
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic comment with real one
      setComments(prev => 
        prev.map(c => c.id === optimisticComment.id ? {
          ...data,
          user_avatar: optimisticComment.user_avatar,
          user_name: optimisticComment.user_name
        } : c)
      );

      toast({
        title: "تم نشر التعليق",
        description: "تم إضافة تعليقك بنجاح"
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      // Remove optimistic comment on error
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      setNewComment(optimisticComment.content);
      setReplyingTo(tempReplyingTo);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء نشر التعليق",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    // Optimistically remove comment from UI
    const deletedComment = comments.find(c => c.id === commentId);
    setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));

    try {
      const { error } = await supabase
        .from("profile_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "تم حذف التعليق",
        description: "تم حذف التعليق بنجاح"
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      // Restore comment on error
      if (deletedComment) {
        setComments(prev => [...prev, deletedComment]);
      }
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف التعليق",
        variant: "destructive"
      });
    }
  };

  const handlePinComment = async (commentId: string, isPinned: boolean) => {
    // Optimistically update pin status
    setComments(prev => 
      prev.map(c => 
        c.id === commentId ? { ...c, is_pinned: !isPinned } : c
      ).sort((a, b) => {
        // Sort: pinned first, then by date
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
    );

    try {
      const { error } = await supabase
        .from("profile_comments")
        .update({ is_pinned: !isPinned })
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: isPinned ? "تم إلغاء التثبيت" : "تم التثبيت",
        description: isPinned ? "تم إلغاء تثبيت التعليق" : "تم تثبيت التعليق بنجاح"
      });
    } catch (error) {
      console.error("Error pinning comment:", error);
      // Revert on error
      setComments(prev => 
        prev.map(c => 
          c.id === commentId ? { ...c, is_pinned: isPinned } : c
        )
      );
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تثبيت التعليق",
        variant: "destructive"
      });
    }
  };

  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [visibleRepliesCount, setVisibleRepliesCount] = useState<Map<string, number>>(new Map());

  const mainComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);
  
  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
        // Reset visible count when collapsing
        setVisibleRepliesCount(prev => {
          const newMap = new Map(prev);
          newMap.delete(commentId);
          return newMap;
        });
      } else {
        newSet.add(commentId);
        // Show first 5 replies when expanding
        setVisibleRepliesCount(prev => {
          const newMap = new Map(prev);
          newMap.set(commentId, 5);
          return newMap;
        });
      }
      return newSet;
    });
  };

  const loadMoreReplies = (commentId: string) => {
    setVisibleRepliesCount(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(commentId) || 5;
      newMap.set(commentId, current + 5);
      return newMap;
    });
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-background/95 backdrop-blur-md border-l border-border transition-all duration-300 z-50 ${
        isVisible ? "translate-x-0" : "translate-x-full"
      } lg:relative lg:translate-x-0 lg:bg-background/50 w-full lg:w-[400px] flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold">التعليقات ({comments.length})</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : mainComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد تعليقات بعد
          </div>
        ) : (
          mainComments.map((comment) => {
            const replies = getReplies(comment.id);
            const isExpanded = expandedReplies.has(comment.id);
            const visibleCount = visibleRepliesCount.get(comment.id) || 5;
            const visibleReplies = isExpanded ? replies.slice(0, visibleCount) : [];
            const hasMoreReplies = replies.length > visibleCount;
            
            return (
              <div key={comment.id} className="space-y-3">
                <Comment
                  comment={comment}
                  isOwner={isOwner}
                  currentUserId={user?.id}
                  onDelete={handleDeleteComment}
                  onPin={handlePinComment}
                  onReply={() => setReplyingTo(comment.id)}
                  repliesCount={replies.length}
                  onToggleReplies={() => toggleReplies(comment.id)}
                  showReplies={isExpanded}
                />
                
                {/* Replies Section */}
                {isExpanded && replies.length > 0 && (
                  <div className="mr-12 space-y-3 relative">
                    {visibleReplies.map((reply, index) => (
                      <Comment
                        key={reply.id}
                        comment={reply}
                        isOwner={isOwner}
                        currentUserId={user?.id}
                        onDelete={handleDeleteComment}
                        onPin={handlePinComment}
                        onReply={() => setReplyingTo(reply.id)}
                        isReply
                        isNested
                        nestLevel={1}
                      />
                    ))}
                    
                    {/* Load more replies button */}
                    {hasMoreReplies && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadMoreReplies(comment.id)}
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        المزيد ({replies.length - visibleCount} ردود)
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Comment Input */}
      <div className="p-4 border-t border-border">
        {user ? (
          <div className="space-y-2">
            {replyingTo && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>الرد على تعليق</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  إلغاء
                </Button>
              </div>
            )}
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="اكتب تعليقك..."
              className="min-h-[80px] resize-none"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري النشر...
                </>
              ) : (
                "نشر التعليق"
              )}
            </Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button variant="default" className="w-full">
              تسجيل الدخول للتعليق
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
