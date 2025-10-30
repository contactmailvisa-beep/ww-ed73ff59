import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Eye, Settings, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import { ProfileStyleType } from "@/components/profile/ProfileStyleSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProfileData {
  id: string;
  user_id: string;
  project_id: string;
  username: string;
  style_type: ProfileStyleType;
  avatar_url: string | null;
  background_type: "color" | "image";
  background_value: string;
  title: string;
  description: string;
  buttons: any[];
  footer_text: string;
}

const ProfileAnalytics = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [viewsCount, setViewsCount] = useState(0);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false);

  useEffect(() => {
    loadProfileAnalytics();
  }, [username]);

  const loadProfileAnalytics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profile_projects")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        toast({
          title: "خطأ",
          description: "البروفايل غير موجود",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      // Check if user owns this profile
      if (profileData.user_id !== user.id) {
        toast({
          title: "غير مصرح",
          description: "ليس لديك صلاحية للوصول لهذا البروفايل",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setProfileData({
        id: profileData.id,
        user_id: profileData.user_id,
        project_id: profileData.project_id,
        username: profileData.username,
        style_type: profileData.style_type as ProfileStyleType,
        avatar_url: profileData.avatar_url,
        background_type: profileData.background_type as "color" | "image",
        background_value: profileData.background_value,
        title: profileData.title,
        description: profileData.description,
        buttons: Array.isArray(profileData.buttons) ? profileData.buttons : [],
        footer_text: profileData.footer_text,
      });
      setNewUsername(profileData.username);

      // Load views count
      const { count, error: viewsError } = await supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileData.id);

      if (viewsError) throw viewsError;
      setViewsCount(count || 0);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل الإحصائيات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError("يسمح فقط بالأحرف الإنجليزية والأرقام والشرطة السفلية");
      return false;
    }

    if (username === profileData?.username) {
      setUsernameError("");
      return true;
    }

    setCheckingUsername(true);
    try {
      // Check username in profile_projects
      const { data: profileData, error: profileError } = await supabase
        .from("profile_projects")
        .select("username")
        .eq("username", username)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") throw profileError;

      if (profileData) {
        setUsernameError("اسم المستخدم محجوز");
        return false;
      }

      // Check url_slug in projects (with @ prefix)
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("url_slug")
        .eq("url_slug", `@${username}`)
        .maybeSingle();

      if (projectError && projectError.code !== "PGRST116") throw projectError;

      if (projectData) {
        setUsernameError("اسم المستخدم محجوز");
        return false;
      }

      setUsernameError("");
      return true;
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameError("خطأ في التحقق من اسم المستخدم");
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = async (value: string) => {
    setNewUsername(value);
    if (value) {
      await checkUsernameAvailability(value);
    }
  };

  const handleUpdateUsername = async () => {
    if (!profileData) return;

    const isAvailable = await checkUsernameAvailability(newUsername);
    if (!isAvailable) return;

    try {
      // Update username in profile_projects
      const { error: profileError } = await supabase
        .from("profile_projects")
        .update({ username: newUsername })
        .eq("id", profileData.id);

      if (profileError) throw profileError;

      // Update url_slug in projects
      const { error: projectError } = await supabase
        .from("projects")
        .update({ url_slug: `@${newUsername}` })
        .eq("id", profileData.project_id);

      if (projectError) throw projectError;

      toast({
        title: "نجح",
        description: "تم تحديث اسم المستخدم بنجاح",
      });

      setIsUsernameDialogOpen(false);
      navigate(`/profile-analytics/${newUsername}`);
    } catch (error) {
      console.error("Error updating username:", error);
      toast({
        title: "خطأ",
        description: "فشل تحديث اسم المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProfile = async () => {
    if (!profileData) return;

    try {
      // Delete from projects first (will cascade delete related data)
      const { error: projectError } = await supabase
        .from("projects")
        .delete()
        .eq("id", profileData.project_id);

      if (projectError) throw projectError;

      // Delete from profile_projects
      const { error: profileError } = await supabase
        .from("profile_projects")
        .delete()
        .eq("id", profileData.id);

      if (profileError) throw profileError;

      toast({
        title: "نجح",
        description: "تم حذف البروفايل بنجاح",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        title: "خطأ",
        description: "فشل حذف البروفايل",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
            <div>
              <h1 className="text-xl font-bold">إحصائيات البروفايل</h1>
              <p className="text-sm text-muted-foreground">@{profileData.username}</p>
            </div>
          </div>
          <Link to={`/@${profileData.username}`} target="_blank">
            <Button variant="outline" size="sm">
              عرض البروفايل
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="analytics" className="gap-2">
              <Eye className="w-4 h-4" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              المعاينة
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات المشاهدات</CardTitle>
                <CardDescription>
                  عدد المشاهدات الفريدة للبروفايل الخاص بك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                    <Eye className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <p className="text-4xl font-bold">{viewsCount}</p>
                    <p className="text-muted-foreground">مشاهدة فريدة</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>رابط البروفايل</CardTitle>
                <CardDescription>شارك هذا الرابط مع الآخرين</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/@${profileData.username}`}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/@${profileData.username}`
                      );
                      toast({
                        title: "تم النسخ",
                        description: "تم نسخ الرابط إلى الحافظة",
                      });
                    }}
                  >
                    نسخ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>معاينة البروفايل</CardTitle>
                <CardDescription>
                  هذا هو شكل البروفايل كما يراه الزوار
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ProfilePreview
                  styleType={profileData.style_type}
                  avatar={profileData.avatar_url || ""}
                  backgroundType={profileData.background_type}
                  backgroundColor={
                    profileData.background_type === "color"
                      ? profileData.background_value
                      : "#1a1a1a"
                  }
                  backgroundImage={
                    profileData.background_type === "image"
                      ? profileData.background_value
                      : ""
                  }
                  title={profileData.title}
                  description={profileData.description}
                  buttons={profileData.buttons}
                  footerText={profileData.footer_text}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات البروفايل</CardTitle>
                <CardDescription>
                  قم بتعديل إعدادات البروفايل الخاص بك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>اسم المستخدم</Label>
                  <div className="flex gap-2">
                    <Input value={`@${profileData.username}`} readOnly className="flex-1" />
                    <Dialog open={isUsernameDialogOpen} onOpenChange={setIsUsernameDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Edit className="w-4 h-4" />
                          تعديل
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>تعديل اسم المستخدم</DialogTitle>
                          <DialogDescription>
                            اختر اسم مستخدم جديد للبروفايل الخاص بك
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">اسم المستخدم الجديد</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                @
                              </span>
                              <Input
                                id="username"
                                value={newUsername}
                                onChange={(e) => handleUsernameChange(e.target.value)}
                                className="pl-8"
                                placeholder="username"
                              />
                              {checkingUsername && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
                              )}
                            </div>
                            {usernameError && (
                              <p className="text-sm text-destructive">{usernameError}</p>
                            )}
                            {!usernameError && newUsername && newUsername !== profileData.username && (
                              <p className="text-sm text-green-600">اسم المستخدم متاح ✓</p>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleUpdateUsername}
                            disabled={
                              checkingUsername ||
                              !!usernameError ||
                              !newUsername ||
                              newUsername === profileData.username
                            }
                          >
                            حفظ التغييرات
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">منطقة الخطر</CardTitle>
                <CardDescription>
                  احذر! هذه الإجراءات لا يمكن التراجع عنها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      حذف البروفايل
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        هذا الإجراء لا يمكن التراجع عنه. سيتم حذف البروفايل بشكل دائم
                        وجميع البيانات المرتبطة به بما في ذلك الإحصائيات.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteProfile}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        حذف نهائياً
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProfileAnalytics;
