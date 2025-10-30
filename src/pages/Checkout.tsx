import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("جاري التحقق من الدفع...");
  const paymentId = searchParams.get("payment_id");

  useEffect(() => {
    if (!paymentId) {
      setStatus("failed");
      setMessage("معرف الدفع غير موجود");
      return;
    }

    checkPaymentAndCreateProfile();
  }, [paymentId]);

  const checkPaymentAndCreateProfile = async () => {
    try {
      const maxAttempts = 30; // 30 attempts = 30 seconds
      let attempts = 0;

      // Poll payment status
      const checkInterval = setInterval(async () => {
        attempts++;

        const { data: payment, error } = await supabase
          .from("payments")
          .select("*")
          .eq("id", paymentId)
          .single();

        if (error) {
          console.error("Error fetching payment:", error);
          clearInterval(checkInterval);
          setStatus("failed");
          setMessage("فشل التحقق من الدفع");
          return;
        }

        if (payment.status === "completed") {
          clearInterval(checkInterval);
          setMessage("تم التحقق من الدفع! جاري إنشاء البروفايل...");
          
          // Create profile
          await createProfile(payment.profile_data, payment.user_id);
        } else if (payment.status === "failed" || payment.status === "cancelled") {
          clearInterval(checkInterval);
          setStatus("failed");
          setMessage("فشلت عملية الدفع");
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setStatus("failed");
          setMessage("انتهت مهلة التحقق من الدفع. يرجى التواصل مع الدعم.");
        }
      }, 1000);

    } catch (error) {
      console.error("Checkout error:", error);
      setStatus("failed");
      setMessage("حدث خطأ أثناء معالجة الدفع");
    }
  };

  const createProfile = async (profileData: any, userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.id !== userId) {
        throw new Error("Unauthorized");
      }

      // Upload avatar if exists
      let avatarUrl = profileData.avatar_url;
      if (profileData.avatar_file) {
        const avatarExt = profileData.avatar_file.split('.').pop();
        const avatarPath = `${userId}/avatar_${Date.now()}.${avatarExt}`;
        
        // Note: In production, you'd upload the actual file
        // For now, we'll use the preview URL
        avatarUrl = profileData.avatar_preview;
      }

      // Upload background if exists
      let bgValue = profileData.background_value;
      if (profileData.background_type === "image" && profileData.background_file) {
        const bgExt = profileData.background_file.split('.').pop();
        const bgPath = `${userId}/background_${Date.now()}.${bgExt}`;
        
        // Note: In production, you'd upload the actual file
        bgValue = profileData.background_preview;
      }

      // Check if username is still available
      const { data: existingProfile } = await supabase
        .from("profile_projects")
        .select("id")
        .eq("username", profileData.username)
        .maybeSingle();

      if (existingProfile) {
        throw new Error("اسم المستخدم غير متاح بعد الآن");
      }

      // Create project entry
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: `${profileData.username} Profile`,
          user_id: userId,
          language: "profile" as any,
          url_slug: await generateSlug(userId),
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create profile
      const { error: profileError } = await supabase
        .from("profile_projects")
        .insert({
          user_id: userId,
          project_id: projectData.id,
          username: profileData.username,
          style_type: profileData.style_type,
          avatar_url: avatarUrl,
          background_type: profileData.background_type,
          background_value: bgValue,
          title: profileData.title,
          description: profileData.description,
          buttons: profileData.buttons,
          footer_text: profileData.footer_text,
        });

      if (profileError) throw profileError;

      setStatus("success");
      setMessage("تم إنشاء البروفايل بنجاح! جاري التحويل...");
      
      toast({
        title: "نجح!",
        description: "تم إنشاء البروفايل بنجاح",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error: any) {
      console.error("Error creating profile:", error);
      setStatus("failed");
      setMessage(error.message || "فشل إنشاء البروفايل");
      
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateSlug = async (userId: string): Promise<string> => {
    const { data } = await supabase.rpc("generate_url_slug", {
      user_discord_id: userId.substring(0, 18),
    });
    return data || `${userId.substring(0, 7)}/${Date.now()}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
            <h2 className="text-2xl font-bold">جاري المعالجة...</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h2 className="text-2xl font-bold text-green-500">نجح!</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-destructive" />
            <h2 className="text-2xl font-bold text-destructive">فشل</h2>
            <p className="text-muted-foreground">{message}</p>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              العودة إلى لوحة التحكم
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Checkout;