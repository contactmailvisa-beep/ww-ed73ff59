import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FaPlus, FaServer, FaSignOutAlt } from "react-icons/fa";
import { User } from "@supabase/supabase-js";
import { CreateProjectDialog } from "@/components/dashboard/CreateProjectDialog";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@/types/database";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

      // Check if user has a profile, if not create one
      // @ts-ignore
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        // Create profile if it doesn't exist
        // Extract discord_id from user metadata or use user id
        const discordId = user.user_metadata?.discord_id || user.id.substring(0, 18);
        
        // @ts-ignore
        await supabase.from("profiles").insert({
          id: user.id,
          discord_id: discordId,
          username: user.user_metadata?.username || user.email?.split("@")[0] || "User",
          avatar_url: user.user_metadata?.avatar_url || null,
        });
      }

      loadProjects();
    } catch (error) {
      console.error("Error checking auth:", error);
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      // @ts-ignore - Table exists in database but types not updated yet
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل المشاريع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FaServer className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              VeHosts
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user?.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <FaSignOutAlt />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">مشاريعي</h2>
            <p className="text-muted-foreground">
              إدارة ومراقبة جميع مشاريعك من مكان واحد
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="gap-2 glow"
            size="lg"
          >
            <FaPlus />
            إنشاء مشروع جديد
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-card" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Card className="glass p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaServer className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">لا توجد مشاريع بعد</h3>
              <p className="text-muted-foreground mb-6">
                ابدأ بإنشاء مشروعك الأول لاستضافة بوت Discord
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="gap-2"
                size="lg"
              >
                <FaPlus />
                إنشاء مشروع جديد
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onRefresh={loadProjects}
              />
            ))}
          </div>
        )}
      </main>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={loadProjects}
      />
    </div>
  );
};

export default Dashboard;
