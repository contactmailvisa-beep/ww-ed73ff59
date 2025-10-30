import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import type { Project, ProjectFile } from "@/types/database";

const ProjectPreview = () => {
  const { userId, projectSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    checkAccess();
  }, [userId, projectSlug]);

  const handlePythonProject = async (projectData: Project, userId: string) => {
    try {
      const projectSlugFromUrl = projectData.url_slug.split("/")[1];

      // Execute Python code via edge function
      // The edge function will handle all logging to console_logs
      const { error: execError } = await supabase.functions.invoke('run-python', {
        body: { 
          projectId: projectData.id,
          userId: userId,
          projectSlug: projectSlugFromUrl
        }
      });

      if (execError) {
        setError("فشل تشغيل البرنامج");
        setLoading(false);
        return;
      }

      // Show console page
      setHtmlContent(`
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Python Console</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Courier New', monospace;
                background: #1e1e1e;
                color: #d4d4d4;
                min-height: 100vh;
                padding: 20px;
              }
              .header {
                background: #2d2d30;
                padding: 16px 20px;
                border-radius: 8px 8px 0 0;
                border-bottom: 2px solid #007acc;
                margin-bottom: 0;
              }
              .header h1 {
                font-size: 18px;
                color: #007acc;
                margin: 0;
              }
              .console {
                background: #1e1e1e;
                border-radius: 0 0 8px 8px;
                padding: 20px;
                min-height: calc(100vh - 100px);
                font-size: 14px;
                line-height: 1.6;
              }
              .message {
                color: #d4d4d4;
                text-align: right;
                direction: rtl;
              }
              .refresh {
                background: #007acc;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-family: inherit;
                font-size: 14px;
                margin-top: 10px;
              }
              .refresh:hover {
                background: #005a9e;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🐍 Python Console - ${projectData.name}</h1>
            </div>
            <div class="console">
              <div class="message">
                ✅ تم تشغيل البرنامج بنجاح<br><br>
                يمكنك الآن الذهاب إلى تبويب "سجلات" في لوحة التحكم لمشاهدة جميع التفاصيل والمخرجات
              </div>
              <button class="refresh" onclick="window.location.reload()">🔄 إعادة التشغيل</button>
            </div>
          </body>
        </html>
      `);
      setLoading(false);
    } catch (err) {
      console.error("Error executing Python:", err);
      setError("حدث خطأ أثناء تنفيذ البرنامج");
      setLoading(false);
    }
  };

  const checkAccess = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get user profile to check discord_id
      // @ts-ignore
      const { data: profile } = await supabase
        .from("profiles")
        .select("discord_id")
        .eq("id", user.id)
        .single();

      // Check if the userId matches the current user's discord_id
      if (profile?.discord_id !== userId) {
        navigate("/dashboard");
        return;
      }

      // Get project by url_slug
      const urlSlug = `${userId}/${projectSlug}`;
      // @ts-ignore
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("url_slug", urlSlug)
        .single();

      if (projectError || !projectData) {
        setError("المشروع غير موجود");
        setLoading(false);
        return;
      }

      setProject(projectData);

      // Check if project is running
      if (projectData.status !== "running") {
        setError("المشروع غير متصل");
        setLoading(false);
        return;
      }

      // Handle Python projects
      if (projectData.language === "python") {
        await handlePythonProject(projectData, userId);
        return;
      }

      // Handle HTML projects
      // Get main file from storage
      const projectSlugFromUrl = projectData.url_slug.split("/")[1];
      const mainFilePath = projectData.main_file?.startsWith("/")
        ? projectData.main_file
        : `/${projectData.main_file}`;
      const storagePath = `${userId}/${projectSlugFromUrl}${mainFilePath}`;

      const { data: fileData, error: fileError } = await supabase.storage
        .from("project-files")
        .download(storagePath);

      if (fileError || !fileData) {
        setError("الملف الرئيسي غير موجود");
        setLoading(false);
        return;
      }

      const content = await fileData.text();

      // Get all files for CSS/JS injection
      // @ts-ignore
      const { data: files } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectData.id);

      // Process HTML content and inject referenced files
      let processedContent = content;
      
      if (files && files.length > 0) {
        // Replace CSS file references
        const cssRegex = /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/g;
        let match;
        while ((match = cssRegex.exec(content)) !== null) {
          const cssFileName = match[1].replace(/^\//, "");
          const cssFilePath = cssFileName.startsWith("/") ? cssFileName : `/${cssFileName}`;
          const cssStoragePath = `${userId}/${projectSlugFromUrl}${cssFilePath}`;
          
          try {
            const { data: cssData } = await supabase.storage
              .from("project-files")
              .download(cssStoragePath);
            
            if (cssData) {
              const cssContent = await cssData.text();
              processedContent = processedContent.replace(
                match[0],
                `<style>${cssContent}</style>`
              );
            }
          } catch (e) {
            console.error("Error loading CSS:", e);
          }
        }

        // Replace JS file references
        const jsRegex = /<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/g;
        while ((match = jsRegex.exec(content)) !== null) {
          const jsFileName = match[1].replace(/^\//, "");
          const jsFilePath = jsFileName.startsWith("/") ? jsFileName : `/${jsFileName}`;
          const jsStoragePath = `${userId}/${projectSlugFromUrl}${jsFilePath}`;
          
          try {
            const { data: jsData } = await supabase.storage
              .from("project-files")
              .download(jsStoragePath);
            
            if (jsData) {
              const jsContent = await jsData.text();
              processedContent = processedContent.replace(
                match[0],
                `<script>${jsContent}</script>`
              );
            }
          } catch (e) {
            console.error("Error loading JS:", e);
          }
        }
      }

      setHtmlContent(processedContent);
      setLoading(false);
    } catch (err) {
      console.error("Error loading project:", err);
      setError("حدث خطأ أثناء تحميل المشروع");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل المشروع...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-muted to-accent/20 flex items-center justify-center mx-auto shadow-lg">
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-muted-foreground animate-pulse"></div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            المشروع غير متصل
          </h1>
          <p className="text-muted-foreground text-lg mb-6 leading-relaxed">{error}</p>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">
              قم بتشغيل المشروع من لوحة التحكم لعرضه هنا
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div 
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="w-full h-full"
      />
    </div>
  );
};

export default ProjectPreview;
