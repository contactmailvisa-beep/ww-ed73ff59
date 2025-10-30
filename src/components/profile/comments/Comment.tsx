import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThumbsUp, ThumbsDown, Heart, MoreVertical, Pin, Trash2, Edit2, Reply } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface CommentProps {
  comment: any;
  isOwner: boolean;
  currentUserId?: string;
  onDelete: (commentId: string) => void;
  onPin: (commentId: string, isPinned: boolean) => void;
  onReply: () => void;
  isReply?: boolean;
  isNested?: boolean;
  nestLevel?: number;
  repliesCount?: number;
  onToggleReplies?: () => void;
  showReplies?: boolean;
}

export const Comment = ({
  comment,
  isOwner,
  currentUserId,
  onDelete,
  onPin,
  onReply,
  isReply = false,
  isNested = false,
  nestLevel = 0,
  repliesCount = 0,
  onToggleReplies,
  showReplies = false
}: CommentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(null);
  const [hasHeart, setHasHeart] = useState(false);
  const [hearts, setHearts] = useState<any[]>([]);
  const [localLikes, setLocalLikes] = useState(comment.likes_count);
  const [localDislikes, setLocalDislikes] = useState(comment.dislikes_count);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUserId) {
      loadUserReaction();
      loadUserHeart();
    }
    loadHearts();
  }, [currentUserId, comment.id]);

  const loadUserReaction = async () => {
    const { data } = await supabase
      .from("comment_reactions")
      .select("reaction_type")
      .eq("comment_id", comment.id)
      .eq("user_id", currentUserId!)
      .maybeSingle();

    if (data) {
      setUserReaction(data.reaction_type as "like" | "dislike");
    }
  };

  const loadUserHeart = async () => {
    const { data } = await supabase
      .from("comment_hearts")
      .select("id")
      .eq("comment_id", comment.id)
      .eq("user_id", currentUserId!)
      .maybeSingle();

    setHasHeart(!!data);
  };

  const loadHearts = async () => {
    const { data } = await supabase
      .from("comment_hearts")
      .select("user_id")
      .eq("comment_id", comment.id);

    if (data && data.length > 0) {
      const userIds = data.map(h => h.user_id);
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);
      
      const heartUsers = userIds.map(userId => {
        const profile = profiles?.find(p => p.id === userId);
        return {
          id: userId,
          avatar: profile?.avatar_url,
          name: profile?.username || "مستخدم"
        };
      });

      setHearts(heartUsers);
    }
  };

  const handleReaction = async (type: "like" | "dislike") => {
    if (!currentUserId) return;

    const oppositeType = type === "like" ? "dislike" : "like";
    const previousReaction = userReaction;
    const previousLikes = localLikes;
    const previousDislikes = localDislikes;

    // Optimistically update UI immediately
    if (userReaction === type) {
      // Remove current reaction
      setUserReaction(null);
      if (type === "like") {
        setLocalLikes(prev => Math.max(0, prev - 1));
      } else {
        setLocalDislikes(prev => Math.max(0, prev - 1));
      }
    } else {
      // Add new reaction and remove opposite
      if (userReaction === oppositeType) {
        if (oppositeType === "like") {
          setLocalLikes(prev => Math.max(0, prev - 1));
        } else {
          setLocalDislikes(prev => Math.max(0, prev - 1));
        }
      }

      setUserReaction(type);
      if (type === "like") {
        setLocalLikes(prev => prev + 1);
      } else {
        setLocalDislikes(prev => prev + 1);
      }
    }

    try {
      // Remove opposite reaction if exists
      await supabase
        .from("comment_reactions")
        .delete()
        .eq("comment_id", comment.id)
        .eq("user_id", currentUserId)
        .eq("reaction_type", oppositeType);

      if (previousReaction === type) {
        // Remove current reaction
        await supabase
          .from("comment_reactions")
          .delete()
          .eq("comment_id", comment.id)
          .eq("user_id", currentUserId)
          .eq("reaction_type", type);
      } else {
        // Add new reaction
        await supabase
          .from("comment_reactions")
          .insert({
            comment_id: comment.id,
            user_id: currentUserId,
            reaction_type: type
          });
      }

      // Update counts in database
      await updateCounts();
    } catch (error) {
      console.error("Error handling reaction:", error);
      // Revert on error
      setUserReaction(previousReaction);
      setLocalLikes(previousLikes);
      setLocalDislikes(previousDislikes);
    }
  };

  const handleHeart = async () => {
    if (!currentUserId) return;

    const previousHasHeart = hasHeart;
    const previousHearts = [...hearts];

    // Optimistically update UI
    if (hasHeart) {
      setHasHeart(false);
      setHearts(prev => prev.filter(h => h.id !== currentUserId));
    } else {
      setHasHeart(true);
      // Get current user data
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", currentUserId)
        .single();

      const newHeart = {
        id: currentUserId,
        avatar: userProfile?.avatar_url,
        name: userProfile?.username || "مستخدم"
      };
      setHearts(prev => [...prev, newHeart]);
    }

    try {
      if (previousHasHeart) {
        await supabase
          .from("comment_hearts")
          .delete()
          .eq("comment_id", comment.id)
          .eq("user_id", currentUserId);
      } else {
        await supabase
          .from("comment_hearts")
          .insert({
            comment_id: comment.id,
            user_id: currentUserId
          });
      }

      await updateCounts();
    } catch (error) {
      console.error("Error handling heart:", error);
      // Revert on error
      setHasHeart(previousHasHeart);
      setHearts(previousHearts);
    }
  };

  const updateCounts = async () => {
    const { data: likes } = await supabase
      .from("comment_reactions")
      .select("id", { count: "exact" })
      .eq("comment_id", comment.id)
      .eq("reaction_type", "like");

    const { data: dislikes } = await supabase
      .from("comment_reactions")
      .select("id", { count: "exact" })
      .eq("comment_id", comment.id)
      .eq("reaction_type", "dislike");

    const { data: heartsData } = await supabase
      .from("comment_hearts")
      .select("id", { count: "exact" })
      .eq("comment_id", comment.id);

    await supabase
      .from("profile_comments")
      .update({
        likes_count: likes?.length || 0,
        dislikes_count: dislikes?.length || 0,
        hearts_count: heartsData?.length || 0
      })
      .eq("id", comment.id);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    const previousContent = comment.content;
    const previousIsEdited = comment.is_edited;

    // Optimistically update UI
    comment.content = editContent.trim();
    comment.is_edited = true;
    setIsEditing(false);

    try {
      const updateData: any = {
        content: editContent.trim(),
        is_edited: true
      };

      // If comment is pinned and user is not owner, unpin it
      if (comment.is_pinned && currentUserId !== comment.user_id && !isOwner) {
        updateData.is_pinned = false;
        comment.is_pinned = false;
      }

      const { error } = await supabase
        .from("profile_comments")
        .update(updateData)
        .eq("id", comment.id);

      if (error) throw error;

      toast({
        title: "تم تعديل التعليق",
        description: "تم حفظ التعديلات بنجاح"
      });
    } catch (error) {
      console.error("Error editing comment:", error);
      // Revert on error
      comment.content = previousContent;
      comment.is_edited = previousIsEdited;
      setEditContent(previousContent);
      setIsEditing(true);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تعديل التعليق",
        variant: "destructive"
      });
    }
  };

  const isCommentOwner = currentUserId === comment.user_id;
  const canEdit = isCommentOwner;
  const canDelete = isCommentOwner || isOwner;
  const canPin = isOwner;

  return (
    <div className="relative">
      {/* Reply connection line - curved and smooth */}
      {isNested && (
        <svg 
          className="absolute right-[-3rem] top-0 w-12 h-20 pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <path
            d="M 48 10 Q 24 10, 24 20 L 24 40"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
            strokeLinecap="round"
          />
        </svg>
      )}
      
      <div
        className={`p-4 rounded-lg border transition-all ${
          comment.is_pinned
            ? "bg-primary/5 border-primary/20"
            : "bg-card/50 border-border"
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={comment.user_avatar} />
            <AvatarFallback>{comment.user_name?.[0] || "U"}</AvatarFallback>
          </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{comment.user_name}</span>
            {comment.is_pinned && (
              <span className="flex items-center gap-1 text-xs text-primary">
                <Pin className="w-3 h-3" />
                مثبت
              </span>
            )}
            {comment.is_edited && (
              <span className="text-xs text-muted-foreground">(معدل)</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: ar
            })}
          </span>
        </div>

        {(canEdit || canDelete || canPin) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 ml-2" />
                  تعديل
                </DropdownMenuItem>
              )}
              {canPin && (
                <DropdownMenuItem onClick={() => onPin(comment.id, comment.is_pinned)}>
                  <Pin className="w-4 h-4 ml-2" />
                  {comment.is_pinned ? "إلغاء التثبيت" : "تثبيت"}
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(comment.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2 mb-3">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleEdit}>
              حفظ
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
            >
              إلغاء
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm mb-3 whitespace-pre-wrap">{comment.content}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        {currentUserId ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 ${userReaction === "like" ? "text-primary" : ""}`}
              onClick={() => handleReaction("like")}
            >
              <ThumbsUp className="w-4 h-4 ml-1" />
              {localLikes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 ${userReaction === "dislike" ? "text-destructive" : ""}`}
              onClick={() => handleReaction("dislike")}
            >
              <ThumbsDown className="w-4 h-4 ml-1" />
              {localDislikes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={onReply}
            >
              <Reply className="w-4 h-4 ml-1" />
              رد
            </Button>
          </>
        ) : (
          <>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {localLikes}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <ThumbsDown className="w-4 h-4" />
              {localDislikes}
            </span>
          </>
        )}

        {/* Show replies button - only for main comments with replies */}
        {!isReply && repliesCount > 0 && onToggleReplies && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-primary"
            onClick={onToggleReplies}
          >
            <Reply className="w-4 h-4 ml-1" />
            الردود ({repliesCount})
          </Button>
        )}

        {/* Hearts */}
        <div className="flex items-center gap-1">
          {currentUserId && (isOwner || isCommentOwner) && (
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 ${hasHeart ? "text-red-500" : ""}`}
              onClick={handleHeart}
            >
              <Heart className={`w-4 h-4 ${hasHeart ? "fill-current" : ""}`} />
            </Button>
          )}
          {hearts.length > 0 && (
            <div className="flex -space-x-2">
              {hearts.slice(0, 3).map((heart) => (
                <div key={heart.id} className="relative">
                  <Avatar className="w-6 h-6 border-2 border-background">
                    <AvatarImage src={heart.avatar} />
                    <AvatarFallback className="text-xs">{heart.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <Heart className="w-3 h-3 text-red-500 fill-current absolute -top-1 -right-1" />
                </div>
              ))}
              {hearts.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs">+{hearts.length - 3}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};
