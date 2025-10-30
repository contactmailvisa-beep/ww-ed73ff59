import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProfileStyleType = 'modern' | 'gradient' | 'glass' | 'neomorphism' | 'minimalist' | 'neon' | 'brutalist' | 'retro' | 'cosmic' | 'paper' | 'terminal' | 'luxury' | 'playful' | 'corporate' | 'artistic' | 'cyberpunk' | 'matrix' | 'ocean' | 'sunset' | 'aurora' | 'vapor' | 'desert' | 'forest' | 'midnight' | 'candy' | 'metallic' | 'pastel' | 'monochrome' | 'rainbow' | 'galaxy' | 'vintage' | 'futuristic';

interface ProfileStyleSelectorProps {
  onSelect: (style: ProfileStyleType) => void;
  onBack: () => void;
}

const styles: { id: ProfileStyleType; name: string; preview: string; description: string }[] = [
  {
    id: 'modern',
    name: 'Modern Minimal',
    preview: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
    description: 'Clean and minimalist design with subtle shadows'
  },
  {
    id: 'gradient',
    name: 'Gradient Bold',
    preview: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500',
    description: 'Bold gradients with vibrant colors'
  },
  {
    id: 'glass',
    name: 'Glassmorphism',
    preview: 'bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-pink-400/30 backdrop-blur-xl',
    description: 'Frosted glass effect with transparency'
  },
  {
    id: 'neomorphism',
    name: 'Neumorphism',
    preview: 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900',
    description: 'Soft shadows with raised/sunken elements'
  },
  {
    id: 'minimalist',
    name: 'Ultra Minimalist',
    preview: 'bg-white dark:bg-black',
    description: 'Pure simplicity with monochrome design'
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    preview: 'bg-gradient-to-br from-black via-purple-900 to-black',
    description: 'Electric neon effects with dark background'
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    preview: 'bg-yellow-400',
    description: 'Bold borders and strong geometric shapes'
  },
  {
    id: 'retro',
    name: 'Retro Wave',
    preview: 'bg-gradient-to-br from-pink-300 via-purple-300 to-cyan-300',
    description: '80s inspired with pastel colors'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Space',
    preview: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black',
    description: 'Starry space theme with cosmic vibes'
  },
  {
    id: 'paper',
    name: 'Paper Card',
    preview: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900',
    description: 'Paper-like texture with soft shadows'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    preview: 'bg-black',
    description: 'Developer console theme with monospace'
  },
  {
    id: 'luxury',
    name: 'Luxury Gold',
    preview: 'bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900',
    description: 'Premium design with gold accents'
  },
  {
    id: 'playful',
    name: 'Playful Pop',
    preview: 'bg-gradient-to-br from-yellow-300 via-green-300 to-blue-300',
    description: 'Fun and colorful with rounded elements'
  },
  {
    id: 'corporate',
    name: 'Corporate Pro',
    preview: 'bg-gradient-to-br from-blue-900 to-slate-900',
    description: 'Professional business style'
  },
  {
    id: 'artistic',
    name: 'Artistic Flow',
    preview: 'bg-gradient-to-br from-rose-400 via-fuchsia-400 to-indigo-400',
    description: 'Creative patterns and artistic vibes'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    preview: 'bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-500',
    description: 'Futuristic tech with neon accents'
  },
  {
    id: 'matrix',
    name: 'Matrix Code',
    preview: 'bg-black',
    description: 'Digital rain with green code aesthetic'
  },
  {
    id: 'ocean',
    name: 'Ocean Deep',
    preview: 'bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400',
    description: 'Deep sea waves with aquatic vibes'
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    preview: 'bg-gradient-to-br from-orange-500 via-red-500 to-purple-600',
    description: 'Warm sunset colors with golden hour'
  },
  {
    id: 'aurora',
    name: 'Aurora Lights',
    preview: 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600',
    description: 'Northern lights inspired colors'
  },
  {
    id: 'vapor',
    name: 'Vaporwave',
    preview: 'bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400',
    description: 'Retro aesthetic with grid patterns'
  },
  {
    id: 'desert',
    name: 'Desert Dunes',
    preview: 'bg-gradient-to-br from-yellow-600 via-orange-500 to-red-600',
    description: 'Sandy textures with warm earth tones'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    preview: 'bg-gradient-to-br from-green-800 via-green-600 to-lime-500',
    description: 'Natural woodland atmosphere'
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    preview: 'bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-900',
    description: 'Dark elegant night theme'
  },
  {
    id: 'candy',
    name: 'Candy Shop',
    preview: 'bg-gradient-to-br from-pink-400 via-rose-400 to-red-400',
    description: 'Sweet colorful bubbly design'
  },
  {
    id: 'metallic',
    name: 'Metallic Steel',
    preview: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600',
    description: 'Industrial metal finish'
  },
  {
    id: 'pastel',
    name: 'Pastel Dream',
    preview: 'bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200',
    description: 'Soft gentle pastel colors'
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    preview: 'bg-gradient-to-br from-gray-900 via-gray-600 to-gray-300',
    description: 'Classic black and white style'
  },
  {
    id: 'rainbow',
    name: 'Rainbow Pride',
    preview: 'bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500',
    description: 'Vibrant multi-color spectrum'
  },
  {
    id: 'galaxy',
    name: 'Galaxy Stars',
    preview: 'bg-gradient-to-br from-purple-900 via-pink-800 to-blue-900',
    description: 'Starry galaxy with nebula clouds'
  },
  {
    id: 'vintage',
    name: 'Vintage Sepia',
    preview: 'bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-200',
    description: 'Old photo vintage filter'
  },
  {
    id: 'futuristic',
    name: 'Futuristic Holo',
    preview: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500',
    description: 'Holographic sci-fi interface'
  }
];

export const ProfileStyleSelector = ({ onSelect, onBack }: ProfileStyleSelectorProps) => {
  const [selectedStyle, setSelectedStyle] = useState<ProfileStyleType | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  const STYLES_PER_PAGE = 8;
  const totalPages = Math.ceil(styles.length / STYLES_PER_PAGE);
  const startIndex = currentPage * STYLES_PER_PAGE;
  const endIndex = startIndex + STYLES_PER_PAGE;
  const currentStyles = styles.slice(startIndex, endIndex);

  const handleSelectStyle = (styleId: ProfileStyleType) => {
    setSelectedStyle(styleId);
    setTimeout(() => {
      onSelect(styleId);
    }, 300);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          اختر ستايل البروفايل
        </h2>
        <p className="text-muted-foreground">اختر التصميم الذي يناسب شخصيتك</p>
        <p className="text-sm text-muted-foreground">
          صفحة {currentPage + 1} من {totalPages} ({styles.length} ستايل)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentStyles.map((style) => (
          <Card
            key={style.id}
            className={cn(
              "relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl",
              selectedStyle === style.id && "ring-4 ring-primary shadow-2xl scale-105"
            )}
            onClick={() => handleSelectStyle(style.id)}
          >
            <div className={cn("h-48 relative", style.preview)}>
              {selectedStyle === style.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-scale-in">
                  <div className="bg-primary text-primary-foreground rounded-full p-4">
                    <Check className="w-8 h-8" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-2" />
                <div className="space-y-1">
                  <div className="h-2 bg-white/40 rounded w-3/4 mx-auto" />
                  <div className="h-2 bg-white/30 rounded w-1/2 mx-auto" />
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-lg">{style.name}</h3>
              <p className="text-sm text-muted-foreground">{style.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="gap-2"
        >
          <ChevronRight className="w-4 h-4" />
          السابق
        </Button>
        
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentPage === index 
                  ? "bg-primary w-8" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        <Button 
          variant="outline" 
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
          className="gap-2"
        >
          التالي
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onBack}>
          رجوع
        </Button>
      </div>
    </div>
  );
};