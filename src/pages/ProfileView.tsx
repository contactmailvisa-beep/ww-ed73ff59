import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, MessageSquare } from "lucide-react";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import { ProfileStyleType } from "@/components/profile/ProfileStyleSelector";
import { Button } from "@/components/ui/button";
import { ProfileComments } from "@/components/profile/comments/ProfileComments";
import { VerificationBadge } from "@/components/profile/VerificationBadge";
import NotFound from "./NotFound";

interface ProfileData {
  style_type: ProfileStyleType;
  avatar_url: string | null;
  background_type: "color" | "image";
  background_value: string;
  title: string;
  description: string;
  buttons: any[];
  footer_text: string;
  is_verified: boolean;
  total_views: number;
}

const ProfileView = () => {
  const { username: rawUsername } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [liveViewers, setLiveViewers] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isProfileOwner, setIsProfileOwner] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Remove @ if present in URL
  const username = rawUsername?.startsWith('@') ? rawUsername.slice(1) : rawUsername;

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      // Check if this looks like a profile username (single segment without /)
      if (username.includes('/')) {
        setLoading(false);
        return;
      }

      try {
        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        setCurrentUserId(user?.id || null);

        // Load profile data
        const { data, error } = await supabase
          .from("profile_projects")
          .select("*")
          .eq("username", username)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProfileId(data.id);
          setIsProfileOwner(user?.id === data.user_id);
          setProfileData({
            style_type: data.style_type as ProfileStyleType,
            avatar_url: data.avatar_url,
            background_type: data.background_type as "color" | "image",
            background_value: data.background_value,
            title: data.title,
            description: data.description,
            buttons: Array.isArray(data.buttons) ? data.buttons : [],
            footer_text: data.footer_text,
            is_verified: data.is_verified || false,
            total_views: data.total_views || 0,
          });

          // Record view if user is authenticated and not the owner
          if (user && user.id !== data.user_id) {
            try {
              const { error: viewError } = await supabase
                .from("profile_views")
                .insert({
                  profile_id: data.id,
                  viewer_id: user.id,
                });
              
              if (viewError && !viewError.message.includes('duplicate')) {
                console.error("Error recording view:", viewError);
              }
            } catch (viewError) {
              console.error("Error recording view:", viewError);
            }
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  // Setup realtime presence for live viewers
  useEffect(() => {
    if (!profileId || !currentUserId) return;

    const channel = supabase.channel(`profile:${profileId}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setLiveViewers(count);
      })
      .on('presence', { event: 'join' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setLiveViewers(count);
      })
      .on('presence', { event: 'leave' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setLiveViewers(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">جاري تحميل البروفايل...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header for non-authenticated users */}
        {!isAuthenticated && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-6 py-3 flex justify-center">
            <Link to="/auth">
              <Button variant="default" size="sm" className="glow">
                Sign in
              </Button>
            </Link>
          </div>
        </header>
      )}
      
        <div className={!isAuthenticated ? "pt-16" : ""}>
          {/* Verification Badge & Stats */}
          {profileData.is_verified && (
            <div className="fixed top-20 left-4 z-40 bg-background/95 backdrop-blur-md border border-border rounded-lg px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <VerificationBadge 
                  isVerified={profileData.is_verified} 
                  totalViews={profileData.total_views}
                  size="lg"
                />
                <div className="text-right">
                  <p className="text-xs font-semibold text-primary">حساب موثق</p>
                  <p className="text-xs text-muted-foreground">
                    {profileData.total_views.toLocaleString('ar-SA')} مشاهدة
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Live Viewers Counter */}
          {isAuthenticated && liveViewers > 0 && (
            <div className="fixed bottom-4 left-4 z-40 bg-background/80 backdrop-blur-md border border-border rounded-full px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{liveViewers}</span>
              </div>
            </div>
          )}

          {/* Comments Toggle Button (Mobile) */}
          <Button
            onClick={() => setShowComments(!showComments)}
            className="fixed bottom-4 right-4 z-40 lg:hidden rounded-full w-14 h-14 shadow-lg"
            size="icon"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
          
          <ProfilePreview
            styleType={profileData.style_type}
            avatar={profileData.avatar_url || ""}
            backgroundType={profileData.background_type}
            backgroundColor={profileData.background_type === "color" ? profileData.background_value : "#1a1a1a"}
            backgroundImage={profileData.background_type === "image" ? profileData.background_value : ""}
            title={profileData.title}
            description={profileData.description}
            buttons={profileData.buttons}
            footerText={profileData.footer_text}
          />
        </div>
      </div>

      {/* Comments Sidebar */}
      {profileId && (
        <ProfileComments
          profileId={profileId}
          isOwner={isProfileOwner}
          isVisible={showComments}
          onClose={() => setShowComments(false)}
        />
      )}
    </div>
  );
};

export default ProfileView;