import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { UserX, FileQuestion, Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Check if it's a profile route (starts with /@)
  const isProfileRoute = location.pathname.startsWith("/@") || 
                        (location.pathname.startsWith("/") && location.pathname.split("/")[1]?.startsWith("@"));
  
  // Check if it's a username-only route (potential profile)
  const isUsernameRoute = location.pathname.split("/").filter(Boolean).length === 1 && 
                          !location.pathname.includes("/auth") && 
                          !location.pathname.includes("/dashboard") &&
                          !location.pathname.includes("/checkout") &&
                          location.pathname !== "/";

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div
        className="text-center max-w-2xl px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icon */}
        <motion.div
          className="flex justify-center mb-8"
          variants={iconVariants}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-card border-2 border-primary/20 rounded-full p-8">
              {isProfileRoute || isUsernameRoute ? (
                <UserX className="w-24 h-24 text-primary" strokeWidth={1.5} />
              ) : (
                <FileQuestion className="w-24 h-24 text-primary" strokeWidth={1.5} />
              )}
            </div>
          </div>
        </motion.div>

        {/* Error Code */}
        <motion.h1 
          className="text-8xl font-bold bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-4"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          404
        </motion.h1>

        {/* Title */}
        <motion.h2
          className="text-3xl font-semibold text-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {isProfileRoute || isUsernameRoute ? "البروفايل غير موجود" : "الصفحة غير موجودة"}
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-lg text-muted-foreground mb-8 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isProfileRoute || isUsernameRoute 
            ? "البروفايل الذي تبحث عنه غير موجود أو تم حذفه. تأكد من اسم المستخدم وحاول مرة أخرى."
            : "عذراً، الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها إلى موقع آخر."}
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              size="lg"
              onClick={() => navigate(-1)}
              variant="outline"
              className="gap-2 min-w-[160px]"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للخلف
            </Button>
          </motion.div>

          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="gap-2 min-w-[160px]"
            >
              <Home className="w-4 h-4" />
              الصفحة الرئيسية
            </Button>
          </motion.div>

          {(isProfileRoute || isUsernameRoute) && (
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                variant="secondary"
                className="gap-2 min-w-[160px]"
              >
                <Search className="w-4 h-4" />
                تصفح البروفايلات
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          className="mt-12 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/40"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
