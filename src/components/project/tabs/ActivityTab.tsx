import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaHistory, FaUndo, FaFile } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import type { FileModification } from "@/types/database";

interface ActivityTabProps {
  projectId: string;
}

const ActivityTab = ({ projectId }: ActivityTabProps) => {
  const { toast } = useToast();
  const [modifications, setModifications] = useState<FileModification[]>([]);
  const [loading, setLoading] = useState(true);
  const [reverting, setReverting] = useState<string | null>(null);

  useEffect(() => {
    loadModifications();
  }, [projectId]);

  const loadModifications = async () => {
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from("file_modifications")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      // @ts-ignore
      setModifications(data || []);
    } catch (error) {
      console.error("Error loading modifications:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل سجل التعديلات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (modification: FileModification) => {
    if (modification.modification_type === "deleted") {
      toast({
        title: "تنبيه",
        description: "لا يمكن استعادة ملف محذوف",
        variant: "destructive",
      });
      return;
    }

    if (modification.modification_type === "created") {
      toast({
        title: "تنبيه",
        description: "لا يمكن التراجع عن إنشاء ملف",
        variant: "destructive",
      });
      return;
    }

    setReverting(modification.id);
    try {
      if (modification.modification_type === "updated" && modification.old_content !== null) {
        // @ts-ignore
        const { error } = await supabase
          .from("project_files")
          .update({ 
            content: modification.old_content,
            updated_at: new Date().toISOString()
          })
          .eq("id", modification.file_id);

        if (error) throw error;

        // Track the revert
        // @ts-ignore
        await supabase.from("file_modifications").insert({
          project_id: projectId,
          file_id: modification.file_id,
          file_name: modification.file_name,
          file_path: modification.file_path,
          modification_type: "updated",
          old_content: modification.new_content,
          new_content: modification.old_content,
        });

        toast({
          title: "تم الاستعادة",
          description: "تم استعادة الإصدار السابق بنجاح",
        });

        loadModifications();
      } else if (modification.modification_type === "renamed" && modification.old_name) {
        const oldPath = modification.file_path.replace(modification.file_name, modification.old_name);

        // @ts-ignore
        const { error } = await supabase
          .from("project_files")
          .update({ 
            file_name: modification.old_name,
            file_path: oldPath,
            updated_at: new Date().toISOString()
          })
          .eq("id", modification.file_id);

        if (error) throw error;

        // Track the revert
        // @ts-ignore
        await supabase.from("file_modifications").insert({
          project_id: projectId,
          file_id: modification.file_id,
          file_name: modification.old_name,
          file_path: oldPath,
          modification_type: "renamed",
          old_name: modification.file_name,
        });

        toast({
          title: "تم الاستعادة",
          description: "تم استعادة الاسم السابق بنجاح",
        });

        loadModifications();
      }
    } catch (error) {
      console.error("Error reverting modification:", error);
      toast({
        title: "خطأ",
        description: "فشل استعادة الإصدار السابق",
        variant: "destructive",
      });
    } finally {
      setReverting(null);
    }
  };

  const getModificationLabel = (type: string) => {
    switch (type) {
      case "created":
        return "تم الإنشاء";
      case "updated":
        return "تم التعديل";
      case "deleted":
        return "تم الحذف";
      case "renamed":
        return "تم إعادة التسمية";
      default:
        return type;
    }
  };

  const getModificationColor = (type: string) => {
    switch (type) {
      case "created":
        return "text-green-500";
      case "updated":
        return "text-blue-500";
      case "deleted":
        return "text-red-500";
      case "renamed":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FaHistory className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">سجل النشاط</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          آخر 30 تعديل على ملفات المشروع
        </p>
      </div>

      {modifications.length === 0 ? (
        <Card className="p-12 text-center">
          <FaHistory className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">لا توجد تعديلات بعد</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {modifications.map((mod) => (
            <Card key={mod.id} className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-1 ${getModificationColor(mod.modification_type)}`}>
                    <FaFile className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${getModificationColor(mod.modification_type)}`}>
                        {getModificationLabel(mod.modification_type)}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {mod.file_name}
                      </span>
                    </div>
                    {mod.modification_type === "renamed" && mod.old_name && (
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {mod.old_name} → {mod.file_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(mod.created_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </p>
                  </div>
                </div>
                {(mod.modification_type === "updated" || mod.modification_type === "renamed") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRevert(mod)}
                    disabled={reverting === mod.id}
                    className="gap-2 shrink-0"
                  >
                    {reverting === mod.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <FaUndo className="w-3 h-3" />
                    )}
                    استعادة
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityTab;
