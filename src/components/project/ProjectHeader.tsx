import { Badge } from "@/components/ui/badge";
import { SiNodedotjs, SiPython, SiTypescript, SiHtml5 } from "react-icons/si";

interface ProjectHeaderProps {
  project: {
    name: string;
    language: string;
    status: string;
  };
}

const languageIcons = {
  nodejs: { icon: SiNodedotjs, color: "text-green-500" },
  python: { icon: SiPython, color: "text-blue-500" },
  typescript: { icon: SiTypescript, color: "text-blue-400" },
  html: { icon: SiHtml5, color: "text-orange-500" },
};

const statusColors = {
  running: "bg-success",
  stopped: "bg-muted-foreground",
  error: "bg-destructive",
};

const ProjectHeader = ({ project }: ProjectHeaderProps) => {
  const langConfig = languageIcons[project.language as keyof typeof languageIcons];
  const Icon = langConfig?.icon || SiNodedotjs;

  return (
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg bg-card flex items-center justify-center ${langConfig?.color}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div>
        <h1 className="text-xl font-bold">{project.name}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="capitalize">{project.language}</span>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${statusColors[project.status as keyof typeof statusColors]} animate-pulse`} />
            <Badge variant={project.status === "running" ? "default" : "secondary"} className="text-xs">
              {project.status === "running" ? "يعمل" : "متوقف"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
