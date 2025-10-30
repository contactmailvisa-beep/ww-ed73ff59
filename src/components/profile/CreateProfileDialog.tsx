import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProfileStyleSelector, ProfileStyleType } from "./ProfileStyleSelector";
import { ProfileEditor } from "./ProfileEditor";

interface CreateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileCreated: () => void;
}

export const CreateProfileDialog = ({
  open,
  onOpenChange,
  onProfileCreated,
}: CreateProfileDialogProps) => {
  const [step, setStep] = useState<"select" | "edit">("select");
  const [selectedStyle, setSelectedStyle] = useState<ProfileStyleType | null>(null);

  const handleStyleSelect = (style: ProfileStyleType) => {
    setSelectedStyle(style);
    setStep("edit");
  };

  const handleBack = () => {
    if (step === "edit") {
      setStep("select");
      setSelectedStyle(null);
    } else {
      onOpenChange(false);
    }
  };

  const handleComplete = () => {
    onProfileCreated();
    onOpenChange(false);
    setStep("select");
    setSelectedStyle(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        {step === "select" && (
          <ProfileStyleSelector onSelect={handleStyleSelect} onBack={() => onOpenChange(false)} />
        )}
        {step === "edit" && selectedStyle && (
          <ProfileEditor
            styleType={selectedStyle}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};