import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { SiDiscord } from "react-icons/si";
import { FaServer } from "react-icons/fa";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleDiscordLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    
    if (error) {
      console.error("Error logging in with Discord:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass p-8 max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                <FaServer className="w-10 h-10 text-primary" />
              </div>
            </motion.div>
            
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                VeHosts
              </h1>
              <p className="text-muted-foreground mt-2">
                استضافة بوتات Discord الاحترافية
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <Button
              onClick={handleDiscordLogin}
              className="w-full h-12 text-lg gap-3 glow hover:scale-105 transition-transform"
              size="lg"
            >
              <SiDiscord className="w-6 h-6" />
              تسجيل الدخول عبر Discord
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              بالتسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية
            </div>
          </motion.div>

          <div className="pt-6 border-t border-border space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>جميع الأنظمة تعمل بشكل طبيعي</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
