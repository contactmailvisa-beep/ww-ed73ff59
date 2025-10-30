import { Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  isVerified: boolean;
  totalViews?: number;
  size?: "sm" | "md" | "lg";
}

export const VerificationBadge = ({ isVerified, totalViews = 0, size = "md" }: VerificationBadgeProps) => {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-background`}
          >
            <Check className="text-white" size={iconSizes[size]} strokeWidth={3} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-background/95 backdrop-blur-md border-border">
          <div className="text-center">
            <p className="font-semibold text-sm">حساب موثق</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalViews.toLocaleString('ar-SA')} مشاهدة
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
