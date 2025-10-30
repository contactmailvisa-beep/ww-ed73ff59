import { motion } from "framer-motion";
import { FaTerminal, FaHistory, FaFolder, FaDatabase, FaCloud, FaRocket, FaCog } from "react-icons/fa";

interface ProjectTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "console", label: "Console", icon: FaTerminal },
  { id: "activity", label: "Activity", icon: FaHistory },
  { id: "files", label: "Files", icon: FaFolder },
  { id: "databases", label: "Databases", icon: FaDatabase },
  { id: "backups", label: "Backups", icon: FaCloud },
  { id: "startup", label: "Startup", icon: FaRocket },
  { id: "settings", label: "Settings", icon: FaCog },
];

const ProjectTabs = ({ activeTab, onTabChange }: ProjectTabsProps) => {
  return (
    <div className="flex items-center gap-1 px-6 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors
              whitespace-nowrap
              ${isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
            
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ProjectTabs;
