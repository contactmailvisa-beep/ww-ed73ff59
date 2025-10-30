import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProjectLanguage } from "@/types/database";
import { Loader2, Globe, Code, FileCode, FileJson, User } from "lucide-react";
import { CreateProfileDialog } from "@/components/profile/CreateProfileDialog";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

const languageOptions = [
  { value: 'html' as const, label: 'HTML', icon: Globe, disabled: false },
  { value: 'nodejs' as const, label: 'Node.js', icon: Code, disabled: true },
  { value: 'python' as const, label: 'Python', icon: FileCode, disabled: false },
  { value: 'profile' as const, label: 'بروفايل', icon: User, disabled: false },
];

export const CreateProjectDialog = ({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) => {
  const [projectName, setProjectName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<ProjectLanguage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const { toast } = useToast();

  const handleLanguageSelect = (language: ProjectLanguage) => {
    setSelectedLanguage(language);
    if (language === 'profile') {
      setShowProfileDialog(true);
      onOpenChange(false);
    }
  };

  const handleCreate = async () => {
    if (!projectName.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم المشروع", variant: "destructive" });
      return;
    }

    if (!selectedLanguage || selectedLanguage === 'profile') {
      toast({ title: "خطأ", description: "يرجى اختيار لغة البرمجة", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("discord_id")
        .eq("id", user.id)
        .single();

      if (!profile?.discord_id) throw new Error("Discord ID not found");

      const { data: slugData, error: slugError } = await supabase
        .rpc("generate_url_slug", { user_discord_id: profile.discord_id });

      if (slugError || !slugData) throw new Error("Failed to generate URL slug");

      let mainFile = "index.js";
      if (selectedLanguage === "html") mainFile = "index.html";
      else if (selectedLanguage === "python") mainFile = "main.py";
      else if (selectedLanguage === "typescript") mainFile = "index.ts";

      const { error: projectError } = await supabase
        .from("projects")
        .insert({
          name: projectName,
          language: selectedLanguage,
          user_id: user.id,
          url_slug: slugData,
          status: "stopped",
          main_file: mainFile,
        });

      if (projectError) throw projectError;

      toast({ title: "نجح!", description: "تم إنشاء المشروع بنجاح" });
      setProjectName("");
      setSelectedLanguage(null);
      onOpenChange(false);
      onProjectCreated();
    } catch (error) {
      console.error("Error creating project:", error);
      toast({ title: "خطأ", description: "فشل إنشاء المشروع", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>إنشاء مشروع جديد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المشروع</Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="أدخل اسم المشروع"
              />
            </div>
            <div className="space-y-2">
              <Label>اختر لغة البرمجة</Label>
              <div className="grid grid-cols-2 gap-3">
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleLanguageSelect(option.value)}
                    disabled={option.disabled}
                    className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                      selectedLanguage === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    } ${option.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <option.icon className="w-8 h-8 mb-2" />
                    <span className="font-medium">{option.label}</span>
                    {option.disabled && (
                      <span className="text-xs text-muted-foreground mt-1">قريباً</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !selectedLanguage || selectedLanguage === 'profile'}>
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              إنشاء المشروع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CreateProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onProfileCreated={onProjectCreated}
      />
    </>
  );
};