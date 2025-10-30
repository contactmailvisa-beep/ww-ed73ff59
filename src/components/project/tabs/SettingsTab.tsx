import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FaTrash, FaEdit } from "react-icons/fa";
import type { Project } from "@/types/database";

interface SettingsTabProps {
  project: Project;
  onUpdate: () => void;
}

const SettingsTab = ({ project, onUpdate }: SettingsTabProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState(project.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleUpdateName = async () => {
    if (!projectName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم المشروع",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      // @ts-ignore
      const { error } = await supabase
        .from("projects")
        .update({ name: projectName })
        .eq("id", project.id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث اسم المشروع بنجاح",
      });

      onUpdate();
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "خطأ",
        description: "فشل تحديث اسم المشروع",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    setDeleting(true);
    try {
      // Delete all project files first
      // @ts-ignore
      await supabase.from("project_files").delete().eq("project_id", project.id);

      // Delete all console logs
      // @ts-ignore
      await supabase.from("console_logs").delete().eq("project_id", project.id);

      // Delete all file modifications
      // @ts-ignore
      await supabase.from("file_modifications").delete().eq("project_id", project.id);

      // Delete the project
      // @ts-ignore
      const { error } = await supabase.from("projects").delete().eq("id", project.id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المشروع بنجاح",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "خطأ",
        description: "فشل حذف المشروع",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FaEdit className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">إعدادات المشروع</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-name">اسم المشروع</Label>
          <Input
            id="project-name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="أدخل اسم المشروع"
          />
        </div>

        <Button onClick={handleUpdateName} disabled={updating} className="w-full">
          {updating ? "جاري التحديث..." : "تحديث الاسم"}
        </Button>
      </Card>

      <Card className="p-6 space-y-4 border-destructive/50">
        <div className="flex items-center gap-2 mb-4">
          <FaTrash className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">منطقة الخطر</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          حذف المشروع نهائياً سيؤدي إلى حذف جميع الملفات والبيانات المرتبطة به. هذا الإجراء لا يمكن
          التراجع عنه.
        </p>

        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="w-full gap-2"
        >
          <FaTrash />
          حذف المشروع نهائياً
        </Button>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المشروع "{project.name}" وجميع الملفات والبيانات المرتبطة به نهائياً. هذا
              الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
              {deleting ? "جاري الحذف..." : "نعم، احذف المشروع"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsTab;
