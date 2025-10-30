import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FaRocket } from "react-icons/fa";

interface StartupTabProps {
  projectId: string;
  mainFile: string;
  onUpdate: () => void;
}

const StartupTab = ({ projectId, mainFile, onUpdate }: StartupTabProps) => {
  const { toast } = useToast();
  const [mainFilePath, setMainFilePath] = useState(mainFile);
  const [updating, setUpdating] = useState(false);

  const handleUpdateMainFile = async () => {
    if (!mainFilePath.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال مسار الملف الرئيسي",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      // @ts-ignore
      const { error } = await supabase
        .from("projects")
        .update({ main_file: mainFilePath })
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث الملف الرئيسي بنجاح",
      });

      onUpdate();
    } catch (error) {
      console.error("Error updating main file:", error);
      toast({
        title: "خطأ",
        description: "فشل تحديث الملف الرئيسي",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <FaRocket className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">إعدادات البدء</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="main-file">الملف الرئيسي للتشغيل</Label>
            <Input
              id="main-file"
              value={mainFilePath}
              onChange={(e) => setMainFilePath(e.target.value)}
              placeholder="مثال: index.html أو /folder/main.py"
              dir="ltr"
            />
            <p className="text-sm text-muted-foreground">
              حدد المسار الكامل للملف الذي سيتم تشغيله عند بدء المشروع. يمكنك كتابة اسم الملف فقط
              إذا كان في المجلد الرئيسي، أو المسار الكامل إذا كان في مجلد فرعي.
            </p>
          </div>

          <div className="bg-accent/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">أمثلة:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside" dir="ltr">
              <li>index.html - ملف في المجلد الرئيسي</li>
              <li>/public/index.html - ملف في مجلد فرعي</li>
              <li>main.py - ملف Python في المجلد الرئيسي</li>
              <li>/src/server.js - ملف JavaScript في مجلد فرعي</li>
            </ul>
          </div>

          <Button onClick={handleUpdateMainFile} disabled={updating} className="w-full">
            {updating ? "جاري التحديث..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StartupTab;
