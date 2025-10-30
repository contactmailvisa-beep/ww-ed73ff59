import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileStyleType } from "./ProfileStyleSelector";
import { cn } from "@/lib/utils";
import * as SocialIcons from "react-icons/si";
import * as BrandIcons from "react-icons/fa";

interface ProfileButton {
  id: string;
  label: string;
  url: string;
  icon: string;
}

interface ProfilePreviewProps {
  styleType: ProfileStyleType;
  avatar?: string;
  backgroundType: "color" | "image";
  backgroundColor: string;
  backgroundImage?: string;
  title: string;
  description: string;
  buttons: ProfileButton[];
  footerText: string;
}

export const ProfilePreview = ({
  styleType,
  avatar,
  backgroundType,
  backgroundColor,
  backgroundImage,
  title,
  description,
  buttons,
  footerText,
}: ProfilePreviewProps) => {
  const getIcon = (iconName: string) => {
    const IconComponent = (BrandIcons as any)[iconName] || (SocialIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  const renderModern = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-2xl">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40" />
          )}
        </div>
      </div>
      <div className="text-center space-y-2 animate-fade-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
          {title}
        </h1>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-sm animate-fade-in">
        {buttons.map((button, index) => (
          <Button
            key={button.id}
            variant="outline"
            className="w-full justify-start gap-3 h-14 hover:scale-105 transition-transform shadow-lg hover:shadow-xl cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
          >
            {getIcon(button.icon)}
            <span className="flex-1 text-center">{button.label}</span>
          </Button>
        ))}
      </div>
      {footerText && (
        <p className="text-sm text-muted-foreground mt-8 animate-fade-in">{footerText}</p>
      )}
    </div>
  );

  const renderGradient = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6 relative overflow-hidden">
      {backgroundType === "color" && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 animate-pulse" />
      )}
      <div className="relative z-10 space-y-6 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse" />
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl backdrop-blur-sm">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
            )}
          </div>
        </div>
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-white drop-shadow-2xl">{title}</h1>
          <p className="text-white/80 max-w-md drop-shadow-lg">{description}</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <Button
              key={button.id}
              className="w-full justify-start gap-3 h-14 bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-md text-white hover:scale-105 transition-all shadow-xl cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span className="flex-1 text-center font-semibold">{button.label}</span>
            </Button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-white/60 mt-8 animate-fade-in drop-shadow-lg">
            {footerText}
          </p>
        )}
      </div>
    </div>
  );

  const renderGlass = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6 relative overflow-hidden">
      {backgroundType === "color" && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        </>
      )}
      <div className="relative z-10 space-y-6 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative w-32 h-32 rounded-full overflow-hidden border border-white/20 shadow-2xl backdrop-blur-xl bg-white/10">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5" />
            )}
          </div>
        </div>
        <div className="text-center space-y-2 animate-fade-in backdrop-blur-md bg-white/5 p-6 rounded-2xl border border-white/10">
          <h1 className="text-4xl font-bold text-foreground drop-shadow-lg">{title}</h1>
          <p className="text-foreground/70 max-w-md">{description}</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <Button
              key={button.id}
              className="w-full justify-start gap-3 h-14 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl hover:scale-105 transition-all shadow-xl cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span className="flex-1 text-center font-medium">{button.label}</span>
            </Button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-foreground/60 mt-8 animate-fade-in backdrop-blur-md bg-white/5 px-4 py-2 rounded-lg">
            {footerText}
          </p>
        )}
      </div>
    </div>
  );

  const renderNeomorphism = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.3),-12px_-12px_24px_rgba(255,255,255,0.15)] transition-all">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
          )}
        </div>
      </div>
      <div className="text-center space-y-2 animate-fade-in p-6 rounded-2xl shadow-[inset_8px_8px_16px_rgba(0,0,0,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.05)]">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-in">
        {buttons.map((button, index) => (
          <Button
            key={button.id}
            variant="ghost"
            className="w-full justify-start gap-3 h-14 shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.1)] transition-all hover:scale-[0.98] cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
          >
            {getIcon(button.icon)}
            <span className="flex-1 text-center font-medium">{button.label}</span>
          </Button>
        ))}
      </div>
      {footerText && (
        <p className="text-sm text-muted-foreground mt-8 animate-fade-in px-4 py-2 rounded-lg shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]">
          {footerText}
        </p>
      )}
    </div>
  );

  const renderMinimalist = () => (
    <div className="min-h-screen flex flex-col items-center justify-start pt-20 p-8 space-y-4">
      <div className="w-24 h-24 border border-foreground/20 overflow-hidden animate-fade-in">
        {avatar ? (
          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-foreground/5" />
        )}
      </div>
      <div className="text-center space-y-1 animate-fade-in max-w-sm">
        <h1 className="text-2xl font-light tracking-wide">{title}</h1>
        <p className="text-sm text-foreground/60">{description}</p>
      </div>
      <div className="w-16 h-px bg-foreground/20 my-4" />
      <div className="flex flex-col gap-2 w-full max-w-xs animate-fade-in">
        {buttons.map((button, index) => (
          <button
            key={button.id}
            className="w-full text-left p-3 border-b border-foreground/10 hover:border-foreground/40 transition-colors text-sm font-light tracking-wide cursor-pointer flex items-center gap-2"
            style={{ animationDelay: `${index * 80}ms` }}
            onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
          >
            {getIcon(button.icon)}
            <span className="flex-1">{button.label}</span>
          </button>
        ))}
      </div>
      {footerText && (
        <p className="text-xs text-foreground/40 mt-12 animate-fade-in">{footerText}</p>
      )}
    </div>
  );

  const renderNeon = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)] animate-pulse" />
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-500 rounded-full blur-3xl opacity-60 group-hover:opacity-80 animate-pulse" />
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:shadow-[0_0_50px_rgba(34,211,238,0.8)] transition-all">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-4xl font-bold text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]" style={{ fontFamily: 'monospace' }}>
            {title}
          </h1>
          <p className="text-purple-300 max-w-md drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">{description}</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="w-full p-4 bg-transparent border-2 border-cyan-400/60 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] transition-all font-semibold tracking-wider cursor-pointer flex items-center gap-3"
              style={{ animationDelay: `${index * 100}ms`, fontFamily: 'monospace' }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span className="flex-1 text-center">{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-purple-400/70 mt-8 animate-fade-in drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
            {footerText}
          </p>
        )}
      </div>
    </div>
  );

  const renderBrutalist = () => (
    <div className="min-h-screen flex flex-row items-stretch p-0">
      <div className="w-1/3 bg-black flex flex-col items-center justify-center p-8 space-y-6 border-r-8 border-foreground">
        <div className="w-40 h-40 border-8 border-foreground overflow-hidden rotate-3 hover:rotate-6 transition-transform">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-yellow-400" />
          )}
        </div>
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground" style={{ lineHeight: '0.9' }}>
            {title}
          </h1>
          <p className="text-foreground/70 font-bold text-sm uppercase">{description}</p>
        </div>
        {footerText && (
          <p className="text-xs text-foreground/50 mt-8 font-mono uppercase">{footerText}</p>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center p-12 space-y-4">
        {buttons.map((button, index) => (
          <button
            key={button.id}
            className="w-full p-6 bg-foreground text-background hover:bg-background hover:text-foreground border-4 border-foreground font-black uppercase text-lg tracking-wider transition-all hover:translate-x-2 cursor-pointer flex items-center gap-4"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
          >
            {getIcon(button.icon)}
            <span className="flex-1 text-left">{button.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderRetro = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] bg-[length:100%_4px] animate-pulse" />
      <div className="relative z-10 space-y-6 flex flex-col items-center">
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 rounded-full blur-lg animate-pulse" />
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-300 via-purple-300 to-cyan-300" />
            )}
          </div>
        </div>
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent" style={{ fontFamily: 'system-ui', textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>
            {title}
          </h1>
          <p className="text-foreground/80 max-w-md font-semibold">{description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-4 bg-gradient-to-r from-pink-300 to-purple-300 hover:from-purple-300 hover:to-cyan-300 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all text-black font-bold cursor-pointer flex flex-col items-center gap-2"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span className="text-sm">{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-foreground/60 mt-8 animate-fade-in font-semibold">
            {footerText}
          </p>
        )}
      </div>
    </div>
  );

  const renderCosmic = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse" />
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-white/30 shadow-[0_0_40px_rgba(139,92,246,0.5)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-bold text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.8)]">
            {title}
          </h1>
          <p className="text-purple-200 max-w-md drop-shadow-lg">{description}</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 hover:border-white/40 rounded-2xl text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all cursor-pointer flex items-center gap-3"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span className="flex-1 text-center font-medium">{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-purple-300/70 mt-8 animate-fade-in drop-shadow-lg">
            {footerText}
          </p>
        )}
      </div>
    </div>
  );

  const renderPaper = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6">
      <div className="max-w-2xl w-full bg-background rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] p-12 space-y-8 animate-fade-in" style={{ transform: 'rotate(-0.5deg)' }}>
        <div className="flex items-center gap-8">
          <div className="w-28 h-28 rounded-full overflow-hidden shadow-[4px_4px_12px_rgba(0,0,0,0.15)] border-4 border-background">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <h1 className="text-4xl font-serif font-bold text-foreground">{title}</h1>
            <p className="text-foreground/70 font-serif italic">{description}</p>
          </div>
        </div>
        <div className="h-px bg-foreground/10" />
        <div className="space-y-3">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="w-full p-4 bg-background hover:bg-foreground/5 border-l-4 border-foreground/20 hover:border-foreground/50 shadow-[2px_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.15)] transition-all text-left cursor-pointer flex items-center gap-3"
              style={{ animationDelay: `${index * 80}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span className="flex-1 font-serif">{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <div className="pt-6 border-t border-foreground/10">
            <p className="text-sm text-foreground/50 font-serif italic text-center">{footerText}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTerminal = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black text-green-400" style={{ fontFamily: 'monospace' }}>
      <div className="w-full max-w-3xl border-2 border-green-400/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.3)]">
        <div className="bg-green-400/10 border-b border-green-400/30 p-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-4 text-sm text-green-400/70">~/profile</span>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-6 animate-fade-in">
            <div className="w-24 h-24 border-2 border-green-400/50 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-green-400/20" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">$</span>
                <span className="text-yellow-400">echo</span>
                <span className="text-white">&quot;{title}&quot;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">$</span>
                <span className="text-yellow-400">cat</span>
                <span className="text-white">description.txt</span>
              </div>
              <p className="text-green-400/80 pl-6">{description}</p>
            </div>
          </div>
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-green-400">$</span>
              <span className="text-yellow-400">ls</span>
              <span className="text-white">-la links/</span>
            </div>
            {buttons.map((button, index) => (
              <button
                key={button.id}
                className="w-full text-left pl-6 p-2 hover:bg-green-400/10 transition-colors cursor-pointer flex items-center gap-3 group"
                style={{ animationDelay: `${index * 80}ms` }}
                onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
              >
                <span className="text-green-400/70 group-hover:text-green-400">→</span>
                {getIcon(button.icon)}
                <span className="text-green-400/70 group-hover:text-green-400">{button.label}</span>
              </button>
            ))}
          </div>
          {footerText && (
            <div className="pt-4 border-t border-green-400/20 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-green-400">$</span>
                <span className="text-green-400/70">{footerText}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLuxury = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]" />
      <div className="relative z-10 space-y-8 flex flex-col items-center max-w-lg">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-full blur-xl opacity-40 animate-pulse" />
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.4)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-600 to-yellow-600" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-serif font-bold text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
            {title}
          </h1>
          <p className="text-amber-200/80 max-w-md font-serif italic text-lg">{description}</p>
        </div>
        <div className="w-full space-y-4 animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="w-full p-5 bg-gradient-to-r from-amber-900/50 to-yellow-900/50 hover:from-amber-800/60 hover:to-yellow-800/60 border-2 border-amber-400/30 hover:border-amber-400/60 rounded-lg backdrop-blur-sm shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all text-amber-400 font-serif font-semibold text-lg cursor-pointer flex items-center gap-4"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span className="flex-1 text-center">{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-amber-400/60 mt-8 animate-fade-in font-serif italic">
            {footerText}
          </p>
        )}
      </div>
    </div>
  );

  const renderPlayful = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6 relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-16 h-16 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              background: `radial-gradient(circle, ${['rgba(253,224,71,0.2)', 'rgba(134,239,172,0.2)', 'rgba(147,197,253,0.2)'][Math.floor(Math.random() * 3)]}, transparent)`
            }}
          />
        ))}
      </div>
      <div className="relative z-10 space-y-6 flex flex-col items-center">
        <div className="relative animate-bounce" style={{ animationDuration: '2s' }}>
          <div className="w-36 h-36 rounded-full overflow-hidden border-8 border-white shadow-2xl hover:rotate-12 transition-transform">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-300 via-green-300 to-blue-300" />
            )}
          </div>
        </div>
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-5xl font-black text-foreground" style={{ textShadow: '4px 4px 0px rgba(253,224,71,0.3)' }}>
            {title}
          </h1>
          <p className="text-foreground/80 max-w-md text-lg font-bold">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-5 bg-gradient-to-br from-yellow-300 to-orange-300 hover:from-green-300 hover:to-blue-300 rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all text-black font-bold text-lg cursor-pointer flex flex-col items-center gap-2"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-foreground/60 mt-8 animate-fade-in font-bold">
            {footerText}
          </p>
        )}
      </div>
    </div>
  );

  const renderCorporate = () => (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-none shadow-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-cyan-600" />
        <div className="p-12 space-y-8">
          <div className="flex items-center gap-8 pb-8 border-b border-slate-700">
            <div className="w-32 h-32 rounded-sm overflow-hidden border-2 border-slate-600">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-4xl font-bold text-white">{title}</h1>
              <p className="text-slate-300 text-lg">{description}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {buttons.map((button, index) => (
              <button
                key={button.id}
                className="p-4 bg-slate-700/50 hover:bg-blue-600/80 border border-slate-600 hover:border-blue-500 transition-all text-white font-semibold cursor-pointer flex items-center gap-3"
                style={{ animationDelay: `${index * 80}ms` }}
                onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
              >
                {getIcon(button.icon)}
                <span className="flex-1 text-left">{button.label}</span>
              </button>
            ))}
          </div>
          {footerText && (
            <div className="pt-8 border-t border-slate-700">
              <p className="text-sm text-slate-400 text-center">{footerText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderArtistic = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      </div>
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute -inset-6 bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" style={{ transform: 'rotate(-5deg)' }} />
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl" style={{ transform: 'rotate(5deg)' }}>
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-400 via-fuchsia-400 to-indigo-400" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in max-w-lg">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent" style={{ fontFamily: 'Georgia, serif' }}>
            {title}
          </h1>
          <p className="text-foreground/80 text-lg italic" style={{ fontFamily: 'Georgia, serif' }}>{description}</p>
        </div>
        <div className="w-full max-w-md space-y-4 animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="w-full p-5 bg-gradient-to-r from-rose-400/10 via-fuchsia-400/10 to-indigo-400/10 hover:from-rose-400/20 hover:via-fuchsia-400/20 hover:to-indigo-400/20 backdrop-blur-md border-2 border-white/20 hover:border-white/40 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center gap-4"
              style={{ animationDelay: `${index * 100}ms`, transform: `rotate(${(index % 2 === 0 ? 1 : -1) * 1}deg)` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span className="flex-1 text-center font-semibold text-lg">{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-foreground/60 mt-8 animate-fade-in italic" style={{ fontFamily: 'Georgia, serif' }}>
            {footerText}
          </p>
        )}
      </div>
    </div>
  );

  const renderCyberpunk = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6 relative overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,255,0.3)_25%,rgba(0,255,255,0.3)_26%,transparent_27%,transparent_74%,rgba(0,255,255,0.3)_75%,rgba(0,255,255,0.3)_76%,transparent_77%,transparent)] bg-[length:100%_8px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(255,0,255,0.3)_25%,rgba(255,0,255,0.3)_26%,transparent_27%,transparent_74%,rgba(255,0,255,0.3)_75%,rgba(255,0,255,0.3)_76%,transparent_77%,transparent)] bg-[length:8px_100%]" />
      </div>
      <div className="relative z-10 space-y-6 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 blur-2xl animate-pulse opacity-60" />
          <div className="absolute -inset-1 bg-cyan-500 animate-pulse opacity-30 clip-path-polygon-[0_0,100%_0,100%_100%,0_100%]" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }} />
          <div className="relative w-36 h-36 overflow-hidden border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.8)] clip-path-polygon" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}>
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-500" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-black text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]" style={{ fontFamily: 'Impact, sans-serif', letterSpacing: '0.1em' }}>
            {title}
          </h1>
          <p className="text-pink-400 max-w-md font-semibold drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]">{description}</p>
        </div>
        <div className="w-full max-w-md space-y-3 animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="w-full p-4 bg-black/80 border-2 border-cyan-400 hover:border-pink-400 text-cyan-400 hover:text-pink-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] transition-all font-bold tracking-widest uppercase cursor-pointer flex items-center gap-3 relative overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms`, clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              {getIcon(button.icon)}
              <span className="flex-1 text-center relative z-10">{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-purple-400/70 mt-8 animate-fade-in font-mono drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
            {footerText}
          </p>
        )}
      </div>
    </div>
  );

  const renderMatrix = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-30 font-mono text-green-500 text-xs overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute animate-[slideDown_15s_linear_infinite]" style={{ left: `${i * 2}%`, animationDelay: `${i * 0.1}s` }}>
            {Array.from({ length: 20 }).map((_, j) => (
              <div key={j}>{Math.random() > 0.5 ? '1' : '0'}</div>
            ))}
          </div>
        ))}
      </div>
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="w-28 h-28 rounded-sm overflow-hidden border-2 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.9)] animate-pulse">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-700" />
          )}
        </div>
        <div className="text-center space-y-3 animate-fade-in font-mono">
          <h1 className="text-4xl font-bold text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.9)]">
            {title}
          </h1>
          <p className="text-green-400/80 max-w-md">{description}</p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="w-full p-3 bg-black border border-green-500 hover:bg-green-500/20 text-green-500 font-mono transition-all cursor-pointer flex items-center justify-center gap-3"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-xs text-green-500/60 mt-8 animate-fade-in font-mono">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderOcean = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-cyan-700 to-teal-500 opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.3),transparent_50%)] animate-pulse" />
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-400 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-8 border-white/30 shadow-2xl backdrop-blur-sm">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-teal-400" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-bold text-white drop-shadow-2xl">{title}</h1>
          <p className="text-white/90 max-w-md text-lg drop-shadow-lg">{description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-5 bg-white/20 backdrop-blur-md border-2 border-white/40 hover:bg-white/30 rounded-3xl text-white transition-all hover:scale-105 cursor-pointer flex flex-col items-center gap-2 shadow-xl"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              <div className="text-3xl">{getIcon(button.icon)}</div>
              <span className="text-sm font-semibold">{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-white/80 mt-8 animate-fade-in drop-shadow-lg">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderSunset = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500 via-red-500 to-purple-900" />
      <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-500 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-yellow-300 shadow-[0_0_60px_rgba(234,179,8,0.8)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-600" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-bold text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">{title}</h1>
          <p className="text-yellow-100 max-w-md text-lg drop-shadow-[0_0_20px_rgba(0,0,0,0.6)]">{description}</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 rounded-2xl text-purple-900 font-bold transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-3 shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-yellow-200/80 mt-8 animate-fade-in drop-shadow-lg">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderAurora = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-600/30 to-purple-700/40 animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.3),transparent_50%)]" />
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full blur-3xl opacity-70 animate-pulse" />
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/50 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]">{title}</h1>
          <p className="text-green-200 max-w-md drop-shadow-lg">{description}</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-4 bg-gradient-to-r from-green-500/30 via-blue-600/30 to-purple-700/30 backdrop-blur-md border border-white/30 hover:border-white/60 rounded-xl text-white transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-3 shadow-xl hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-green-300/70 mt-8 animate-fade-in drop-shadow-lg">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderVapor = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden bg-purple-900">
      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_26%,transparent_27%,transparent)] bg-[length:100%_50px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-pink-500/20 via-purple-500/20 to-cyan-500/20" />
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-cyan-400 blur-2xl opacity-60 animate-pulse" />
          <div className="relative w-40 h-40 overflow-hidden border-4 border-pink-400 shadow-[0_0_40px_rgba(244,114,182,0.8)]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-cyan-400" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-bold text-pink-300 drop-shadow-[0_0_30px_rgba(244,114,182,1)]" style={{ fontFamily: 'Impact, sans-serif' }}>
            {title}
          </h1>
          <p className="text-cyan-300 max-w-md text-lg drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">{description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 w-full max-w-md animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 border-2 border-white text-white font-bold transition-all hover:scale-110 cursor-pointer shadow-[0_0_20px_rgba(244,114,182,0.6)]"
              style={{ animationDelay: `${index * 100}ms`, clipPath: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)' }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              <div className="flex items-center gap-2">
                {getIcon(button.icon)}
                <span>{button.label}</span>
              </div>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-pink-300/70 mt-8 animate-fade-in font-mono drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderDesert = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-600 via-orange-500 to-red-700" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(251,191,36,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(251,191,36,0.3),transparent_50%)]" />
      </div>
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-50 animate-pulse" />
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-8 border-yellow-300/50 shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-500 to-orange-600" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-bold text-yellow-100 drop-shadow-[0_5px_20px_rgba(0,0,0,0.8)]">{title}</h1>
          <p className="text-yellow-200/90 max-w-md text-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">{description}</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-4 bg-gradient-to-r from-yellow-700 to-orange-700 hover:from-yellow-600 hover:to-orange-600 rounded-lg text-yellow-100 font-bold transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-yellow-200/70 mt-8 animate-fade-in drop-shadow-lg">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderForest = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-700 to-lime-600" />
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-green-400/20 blur-2xl animate-pulse"
            style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-lime-400 rounded-full blur-3xl opacity-40 animate-pulse" />
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-lime-400 shadow-[0_0_40px_rgba(163,230,53,0.6)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-600 to-lime-500" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-4xl font-bold text-lime-100 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">{title}</h1>
          <p className="text-green-200 max-w-md drop-shadow-lg">{description}</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-4 bg-green-800/60 backdrop-blur-sm border-2 border-lime-400/50 hover:border-lime-400 rounded-2xl text-lime-100 transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-3 shadow-xl hover:shadow-[0_0_30px_rgba(163,230,53,0.5)]"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-lime-300/70 mt-8 animate-fade-in drop-shadow-lg">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderMidnight = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950" />
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random(),
            }}
          />
        ))}
      </div>
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-blue-300/50 shadow-[0_0_60px_rgba(96,165,250,0.5)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-bold text-blue-100 drop-shadow-[0_0_30px_rgba(59,130,246,0.8)]">{title}</h1>
          <p className="text-blue-200 max-w-md text-lg drop-shadow-lg">{description}</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-5 bg-blue-900/40 backdrop-blur-md border border-blue-400/40 hover:border-blue-300 rounded-xl text-blue-100 transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span className="font-semibold">{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-blue-300/70 mt-8 animate-fade-in drop-shadow-lg">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderCandy = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-rose-300 to-red-300" />
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bounce"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2), transparent)`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-pink-400 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-8 border-white shadow-[0_0_50px_rgba(244,114,182,0.6)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-red-400" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-6xl font-black text-white drop-shadow-[0_5px_20px_rgba(244,114,182,0.8)]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            {title}
          </h1>
          <p className="text-white/90 max-w-md text-xl drop-shadow-lg font-bold">{description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 w-full max-w-md animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="px-8 py-4 bg-white hover:bg-pink-100 rounded-full text-pink-600 font-black text-lg transition-all hover:scale-110 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(244,114,182,0.4)]"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              <div className="flex items-center gap-2">
                {getIcon(button.icon)}
                <span>{button.label}</span>
              </div>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-white/80 mt-8 animate-fade-in font-bold drop-shadow-lg">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderMetallic = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-gray-600 to-zinc-700" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.3)_49%,rgba(255,255,255,0.3)_51%,transparent_52%)] bg-[length:20px_20px]" />
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gray-400 blur-2xl opacity-40" />
          <div className="relative w-32 h-32 overflow-hidden border-4 border-gray-300 shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.3)]" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}>
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-400 to-zinc-600" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-bold text-gray-100 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.2)' }}>
            {title}
          </h1>
          <p className="text-gray-300 max-w-md text-lg drop-shadow-lg">{description}</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-4 bg-gradient-to-r from-slate-600 to-zinc-600 hover:from-slate-500 hover:to-zinc-500 border-2 border-gray-400 text-gray-100 font-bold transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.2)]"
              style={{ animationDelay: `${index * 100}ms`, clipPath: 'polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)' }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-gray-400 mt-8 animate-fade-in drop-shadow-lg">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderPastel = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100" />
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-pink-200 to-purple-200 blur-3xl animate-pulse"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full blur-2xl opacity-60 animate-pulse" />
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-8 border-white shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-200 to-blue-200" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-bold text-purple-400 drop-shadow-sm">{title}</h1>
          <p className="text-purple-600/80 max-w-md text-lg">{description}</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-5 bg-white/80 backdrop-blur-sm hover:bg-white rounded-3xl text-purple-600 font-semibold transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-purple-500/70 mt-8 animate-fade-in">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderMonochrome = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden bg-white dark:bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black" />
      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,black_2px,black_4px)]" />
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="relative w-32 h-32 rounded-sm overflow-hidden border-4 border-black dark:border-white shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover grayscale" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-600 to-black" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-6xl font-black text-black dark:text-white uppercase tracking-tight">{title}</h1>
          <p className="text-gray-700 dark:text-gray-300 max-w-md text-lg font-medium">{description}</p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-4 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-bold transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-3 border-2 border-black dark:border-white"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span className="uppercase tracking-wide">{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-8 animate-fade-in uppercase tracking-wide">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderRainbow = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400 animate-[gradient_8s_ease_infinite]" style={{ backgroundSize: '400% 400%' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_60%)]" />
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full blur-3xl opacity-70 animate-spin-slow" />
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-8 border-white shadow-[0_0_60px_rgba(255,255,255,0.8)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-6xl font-black text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">{title}</h1>
          <p className="text-white/95 max-w-md text-xl font-bold drop-shadow-lg">{description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 w-full max-w-md animate-fade-in">
          {buttons.map((button, index) => {
            const colors = ['from-red-500 to-orange-500', 'from-yellow-500 to-green-500', 'from-green-500 to-blue-500', 'from-blue-500 to-purple-500', 'from-purple-500 to-pink-500'];
            return (
              <button
                key={button.id}
                className={`px-6 py-4 bg-gradient-to-r ${colors[index % colors.length]} hover:scale-110 rounded-2xl text-white font-bold transition-all cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
              >
                <div className="flex items-center gap-2">
                  {getIcon(button.icon)}
                  <span>{button.label}</span>
                </div>
              </button>
            );
          })}
        </div>
        {footerText && (
          <p className="text-sm text-white/90 mt-8 animate-fade-in font-bold drop-shadow-lg">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderGalaxy = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900" />
      <div className="absolute inset-0">
        {Array.from({ length: 200 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random(),
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.4),transparent_70%)] animate-pulse" />
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-3xl opacity-80 animate-pulse" />
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-purple-400 shadow-[0_0_60px_rgba(168,85,247,0.8)]">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-bold text-white drop-shadow-[0_0_40px_rgba(168,85,247,1)]">{title}</h1>
          <p className="text-purple-200 max-w-md text-lg drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">{description}</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-4 bg-gradient-to-r from-purple-600/40 via-pink-600/40 to-blue-600/40 backdrop-blur-md border-2 border-purple-400/50 hover:border-purple-300 rounded-2xl text-white transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)]"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span className="font-semibold">{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-purple-300/70 mt-8 animate-fade-in drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderVintage = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.2),transparent_70%)]" />
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JhaW4iIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFpbikiLz48L3N2Zz4=')]" />
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-600 blur-2xl opacity-40" />
          <div className="relative w-36 h-36 rounded-sm overflow-hidden border-8 border-amber-800/30 shadow-[0_10px_40px_rgba(0,0,0,0.3)] sepia" style={{ filter: 'sepia(0.4) contrast(1.1)' }}>
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" style={{ filter: 'sepia(0.6)' }} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-600" />
            )}
          </div>
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-serif font-bold text-amber-900 drop-shadow-sm">{title}</h1>
          <p className="text-amber-800 max-w-md text-lg font-serif">{description}</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="p-4 bg-amber-200/60 hover:bg-amber-300/70 border-2 border-amber-600/40 rounded text-amber-900 font-serif font-semibold transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-3 shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              {getIcon(button.icon)}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-amber-700/70 mt-8 animate-fade-in font-serif">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderFuturistic = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 via-blue-900/50 to-purple-900/50" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 blur-3xl opacity-60 animate-pulse" />
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-30 blur-2xl animate-pulse" />
          <div className="relative w-32 h-32 overflow-hidden border-2 border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.8)] backdrop-blur-sm" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}>
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700" />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 animate-pulse" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
        </div>
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_30px_rgba(34,211,238,1)]">
            {title}
          </h1>
          <p className="text-cyan-300 max-w-md text-lg font-medium drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">{description}</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm animate-fade-in">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className="group relative p-4 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 backdrop-blur-md border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] overflow-hidden"
              style={{ animationDelay: `${index * 100}ms`, clipPath: 'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)' }}
              onClick={() => window.open(button.url, '_blank', 'noopener,noreferrer')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {getIcon(button.icon)}
              <span className="font-bold relative z-10">{button.label}</span>
            </button>
          ))}
        </div>
        {footerText && (
          <p className="text-sm text-cyan-400/60 mt-8 animate-fade-in font-mono drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">{footerText}</p>
        )}
      </div>
    </div>
  );

  const renderStyle = () => {
    switch (styleType) {
      case "modern":
        return renderModern();
      case "gradient":
        return renderGradient();
      case "glass":
        return renderGlass();
      case "neomorphism":
        return renderNeomorphism();
      case "minimalist":
        return renderMinimalist();
      case "neon":
        return renderNeon();
      case "brutalist":
        return renderBrutalist();
      case "retro":
        return renderRetro();
      case "cosmic":
        return renderCosmic();
      case "paper":
        return renderPaper();
      case "terminal":
        return renderTerminal();
      case "luxury":
        return renderLuxury();
      case "playful":
        return renderPlayful();
      case "corporate":
        return renderCorporate();
      case "artistic":
        return renderArtistic();
      case "cyberpunk":
        return renderCyberpunk();
      case "matrix":
        return renderMatrix();
      case "ocean":
        return renderOcean();
      case "sunset":
        return renderSunset();
      case "aurora":
        return renderAurora();
      case "vapor":
        return renderVapor();
      case "desert":
        return renderDesert();
      case "forest":
        return renderForest();
      case "midnight":
        return renderMidnight();
      case "candy":
        return renderCandy();
      case "metallic":
        return renderMetallic();
      case "pastel":
        return renderPastel();
      case "monochrome":
        return renderMonochrome();
      case "rainbow":
        return renderRainbow();
      case "galaxy":
        return renderGalaxy();
      case "vintage":
        return renderVintage();
      case "futuristic":
        return renderFuturistic();
      default:
        return renderModern();
    }
  };

  const backgroundStyle =
    backgroundType === "image" && backgroundImage
      ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
      : { backgroundColor };

  return (
    <Card className="overflow-hidden shadow-2xl">
      <div className={cn("relative")} style={backgroundStyle}>
        {renderStyle()}
      </div>
    </Card>
  );
};