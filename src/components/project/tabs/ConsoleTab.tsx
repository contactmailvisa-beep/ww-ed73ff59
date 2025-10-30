import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaTrash, FaDownload } from "react-icons/fa";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import type { ConsoleLog } from "@/types/database";

interface ConsoleTabProps {
  projectId: string;
  urlSlug: string;
  status: string;
}

type Log = ConsoleLog;

const ConsoleTab = ({ projectId, urlSlug, status }: ConsoleTabProps) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const projectUrl = `${window.location.origin}/${urlSlug}`;
  const isRunning = status === "running" || status === "starting";

  useEffect(() => {
    loadLogs();
    
    // Subscribe to new logs
    const subscription = supabase
      .channel(`console_logs_${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "console_logs",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          setLogs((prev) => [payload.new as Log, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);

  const loadLogs = async () => {
    try {
      // @ts-ignore - Table exists in database but types not updated yet
      const { data, error } = await supabase
        .from("console_logs")
        .select("*")
        .eq("project_id", projectId)
        .order("timestamp", { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      // @ts-ignore - Table exists in database but types not updated yet
      const { error } = await supabase
        .from("console_logs")
        .delete()
        .eq("project_id", projectId);

      if (error) throw error;
      setLogs([]);
    } catch (error) {
      console.error("Error clearing logs:", error);
    }
  };

  const handleDownloadLogs = () => {
    const content = logs
      .map((log) => `[${new Date(log.timestamp).toLocaleString()}] [${log.log_type}] ${log.message}`)
      .join("\n");
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `console-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      case "success":
        return "text-green-400";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="px-6 py-3 bg-[#2d2d2d] border-b border-[#3d3d3d] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Console Output</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadLogs}
              className="text-white hover:bg-[#3d3d3d]"
            >
              <FaDownload className="w-4 h-4 ml-2" />
              تنزيل
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearLogs}
              className="text-white hover:bg-[#3d3d3d]"
            >
              <FaTrash className="w-4 h-4 ml-2" />
              مسح الكل
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-[#252525] px-4 py-2 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-sm text-gray-400">رابط المشروع:</span>
          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-mono"
            dir="ltr"
          >
            {projectUrl}
          </a>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="text-gray-400 font-mono text-sm">جاري التحميل...</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-400 font-mono text-sm">لا توجد سجلات بعد...</div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.01 }}
                className={`font-mono text-sm ${getLogColor(log.log_type)}`}
              >
                <span className="text-gray-500">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>{" "}
                <span className="font-semibold">[{log.log_type}]</span>{" "}
                {log.message}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsoleTab;
