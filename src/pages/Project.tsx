import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaPlay, FaStop, FaRedo } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import ProjectTabs from "@/components/project/ProjectTabs";
import ProjectHeader from "@/components/project/ProjectHeader";
import ConsoleTab from "@/components/project/tabs/ConsoleTab";
import FilesTab from "@/components/project/tabs/FilesTab";
import SettingsTab from "@/components/project/tabs/SettingsTab";
import ActivityTab from "@/components/project/tabs/ActivityTab";
import DatabasesTab from "@/components/project/tabs/DatabasesTab";
import BackupsTab from "@/components/project/tabs/BackupsTab";
import StartupTab from "@/components/project/tabs/StartupTab";
import type { Project } from "@/types/database";

type ProjectData = Project;

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const activeTab = searchParams.get("tab") || "console";

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      // @ts-ignore - Table exists in database but types not updated yet
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error("Error loading project:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل المشروع",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleStatusChange = async (newStatus: "running" | "stopped" | "error") => {
    try {
      // @ts-ignore - Table exists in database but types not updated yet
      const { error } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setProject((prev) => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: "تم التحديث",
        description: `تم ${newStatus === "running" ? "تشغيل" : "إيقاف"} المشروع`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة المشروع",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <FaArrowLeft />
              العودة
            </Button>
            
            <ProjectHeader project={project} />
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("stopped")}
              className="gap-2"
            >
              <FaRedo className="w-4 h-4" />
              إعادة التشغيل
            </Button>
            
            {project.status === "running" ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleStatusChange("stopped")}
                className="gap-2"
              >
                <FaStop className="w-4 h-4" />
                إيقاف
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleStatusChange("running")}
                className="gap-2 glow"
              >
                <FaPlay className="w-4 h-4" />
                تشغيل
              </Button>
            )}
          </div>
        </div>

        <ProjectTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === "console" && <ConsoleTab projectId={project.id} urlSlug={project.url_slug} status={project.status} />}
        {activeTab === "activity" && <ActivityTab projectId={project.id} />}
        {activeTab === "files" && <FilesTab projectId={project.id} />}
        {activeTab === "databases" && <DatabasesTab projectId={project.id} />}
        {activeTab === "backups" && <BackupsTab projectId={project.id} />}
        {activeTab === "startup" && <StartupTab projectId={project.id} mainFile={project.main_file} onUpdate={loadProject} />}
        {activeTab === "settings" && (
          <SettingsTab project={project} onUpdate={loadProject} />
        )}
      </main>
    </div>
  );
};

export default Project;
