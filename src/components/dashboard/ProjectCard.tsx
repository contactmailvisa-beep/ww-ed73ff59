import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaPlay, FaStop, FaCog, FaTrash, FaChartBar, FaUser } from "react-icons/fa";
import { SiNodedotjs, SiPython, SiTypescript, SiHtml5 } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    language: string;
    status: string;
    url_slug: string;
    created_at: string;
  };
  index: number;
  onRefresh: () => void;
}

const languageIcons = {
  nodejs: { icon: SiNodedotjs, color: "text-green-500" },
  python: { icon: SiPython, color: "text-blue-500" },
  typescript: { icon: SiTypescript, color: "text-blue-400" },
  html: { icon: SiHtml5, color: "text-orange-500" },
  profile: { icon: FaUser, color: "text-purple-500" },
};

const statusColors = {
  running: "bg-success",
  stopped: "bg-muted-foreground",
  error: "bg-destructive",
};

const ProjectCard = ({ project, index, onRefresh }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const langConfig = languageIcons[project.language as keyof typeof languageIcons];
  const Icon = langConfig?.icon || SiNodedotjs;
  const isProfile = project.language === "profile";
  // Extract username from url_slug (remove @ prefix if exists)
  const username = isProfile && project.url_slug.startsWith('@') 
    ? project.url_slug.slice(1) 
    : project.url_slug;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;

    try {
      if (isProfile) {
        // Delete profile_projects first
        const { error: profileError } = await supabase
          .from("profile_projects")
          .delete()
          .eq("project_id", project.id);

        if (profileError) throw profileError;
      }

      // Delete from projects (will cascade delete related data)
      // @ts-ignore - Table exists in database but types not updated yet
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: isProfile ? "تم حذف البروفايل بنجاح" : "تم حذف المشروع بنجاح",
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "خطأ",
        description: isProfile ? "فشل حذف البروفايل" : "فشل حذف المشروع",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className="glass p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
        onClick={() => navigate(isProfile ? `/profile-analytics/${username}` : `/project/${project.id}`)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg bg-card flex items-center justify-center ${langConfig?.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-muted-foreground capitalize">
                {project.language}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[project.status as keyof typeof statusColors]} animate-pulse`} />
            <Badge variant={project.status === "running" ? "default" : "secondary"}>
              {project.status === "running" ? "يعمل" : "متوقف"}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground font-mono bg-muted/30 p-2 rounded">
            {isProfile ? `${window.location.origin}/@${username}` : `${window.location.origin}/${project.url_slug}`}
          </div>

          <div className="flex gap-2">
            {isProfile ? (
              <>
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile-analytics/${username}`);
                  }}
                >
                  <FaChartBar className="w-3 h-3 mr-2" />
                  الإحصائيات
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <FaTrash className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant={project.status === "running" ? "destructive" : "default"}
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {project.status === "running" ? (
                    <>
                      <FaStop className="w-3 h-3 mr-2" />
                      إيقاف
                    </>
                  ) : (
                    <>
                      <FaPlay className="w-3 h-3 mr-2" />
                      تشغيل
                    </>
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project/${project.id}?tab=settings`);
                  }}
                >
                  <FaCog className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <FaTrash className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;
