import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaDownload, FaCloud } from "react-icons/fa";
import JSZip from "jszip";
import { Loader2 } from "lucide-react";

interface BackupsTabProps {
  projectId: string;
}

const BackupsTab = ({ projectId }: BackupsTabProps) => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadBackup = async () => {
    setDownloading(true);
    try {
      // @ts-ignore
      const { data: files, error } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId);

      if (error) throw error;

      if (!files || files.length === 0) {
        toast({
          title: "تنبيه",
          description: "لا توجد ملفات للنسخ الاحتياطي",
          variant: "destructive",
        });
        return;
      }

      const zip = new JSZip();

      files.forEach((file) => {
        if (!file.is_directory && file.content) {
          const path = file.file_path.startsWith("/")
            ? file.file_path.substring(1)
            : file.file_path;
          zip.file(path, file.content);
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `project-backup-${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "تم التحميل",
        description: "تم تحميل النسخة الاحتياطية بنجاح",
      });
    } catch (error) {
      console.error("Error downloading backup:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل النسخة الاحتياطية",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <FaCloud className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">النسخ الاحتياطي</h3>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            قم بتحميل نسخة احتياطية من جميع ملفات مشروعك على هيئة ملف مضغوط ZIP. يمكنك استخدام
            هذه النسخة لاستعادة المشروع أو نقله إلى مكان آخر.
          </p>

          <div className="bg-accent/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">ماذا يتضمن النسخ الاحتياطي؟</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>جميع ملفات المشروع</li>
              <li>المجلدات والتنظيم الكامل</li>
              <li>محتوى جميع الملفات</li>
            </ul>
          </div>

          <Button
            onClick={handleDownloadBackup}
            disabled={downloading}
            className="w-full gap-2"
            size="lg"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التحميل...
              </>
            ) : (
              <>
                <FaDownload className="w-4 h-4" />
                تحميل النسخة الاحتياطية
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BackupsTab;
