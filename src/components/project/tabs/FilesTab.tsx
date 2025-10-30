import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaFile, FaFolder, FaFolderOpen, FaPlus, FaUpload, FaTrash, FaEdit, FaFileArchive, FaDownload, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { SiHtml5, SiCss3, SiJavascript, SiPython } from "react-icons/si";
import JSZip from "jszip";
import { Loader2, Check } from "lucide-react";
import type { ProjectFile } from "@/types/database";
import CodeEditor from "./CodeEditor";

interface FilesTabProps {
  projectId: string;
}

interface FileTreeNode {
  file: ProjectFile;
  children: FileTreeNode[];
  expanded: boolean;
}

const FilesTab = ({ projectId }: FilesTabProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: ProjectFile } | null>(null);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isDirectory, setIsDirectory] = useState(false);
  const [renameFile, setRenameFile] = useState<ProjectFile | null>(null);
  const [newName, setNewName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [creating, setCreating] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [draggedFile, setDraggedFile] = useState<ProjectFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const loadFiles = async () => {
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId)
        .order("file_path", { ascending: true });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error loading files:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل الملفات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      html: "markup",
      htm: "markup",
      css: "css",
      json: "json",
      md: "markdown",
      txt: "plaintext",
    };
    return languageMap[ext || ""] || "plaintext";
  };

  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) return null;
    
    const ext = fileName.split(".").pop()?.toLowerCase();
    const iconClass = "w-4 h-4";
    
    switch(ext) {
      case "html":
      case "htm":
        return <SiHtml5 className={`${iconClass} text-orange-500`} />;
      case "css":
        return <SiCss3 className={`${iconClass} text-blue-500`} />;
      case "js":
      case "jsx":
        return <SiJavascript className={`${iconClass} text-yellow-500`} />;
      case "py":
        return <SiPython className={`${iconClass} text-blue-400`} />;
      default:
        return <FaFile className={`${iconClass} text-primary`} />;
    }
  };

  const handleFileClick = async (file: ProjectFile) => {
    if (file.is_directory) return;
    
    setSelectedFile(file);
    setEditorContent(file.content || "");
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;

    try {
      const oldContent = selectedFile.content;

      // Get project slug and discord_id
      // @ts-ignore
      const { data: projectData } = await supabase
        .from("projects")
        .select("url_slug, user_id")
        .eq("id", projectId)
        .single();

      if (!projectData) throw new Error("Project not found");

      // @ts-ignore
      const { data: profile } = await supabase
        .from("profiles")
        .select("discord_id")
        .eq("id", projectData.user_id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const projectSlug = projectData.url_slug.split("/")[1];
      const storagePath = `${profile.discord_id}/${projectSlug}${selectedFile.file_path}`;

      // Upload to storage
      const blob = new Blob([editorContent], { type: "text/plain" });
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(storagePath, blob, { upsert: true });

      if (uploadError) throw uploadError;

      // @ts-ignore
      const { error } = await supabase
        .from("project_files")
        .update({ content: editorContent, updated_at: new Date().toISOString() })
        .eq("id", selectedFile.id);

      if (error) throw error;

      // Track modification
      // @ts-ignore
      await supabase.from("file_modifications").insert({
        project_id: projectId,
        file_id: selectedFile.id,
        file_name: selectedFile.file_name,
        file_path: selectedFile.file_path,
        modification_type: "updated",
        old_content: oldContent,
        new_content: editorContent,
      });

      toast({
        title: "تم الحفظ",
        description: "تم حفظ الملف بنجاح",
      });

      loadFiles();
    } catch (error) {
      console.error("Error saving file:", error);
      toast({
        title: "خطأ",
        description: "فشل حفظ الملف",
        variant: "destructive",
      });
    }
  };

  const buildFileTree = (files: ProjectFile[]): FileTreeNode[] => {
    const rootNodes: FileTreeNode[] = [];
    const nodeMap = new Map<string, FileTreeNode>();

    // Sort files to ensure parents come before children
    const sortedFiles = [...files].sort((a, b) => {
      const aDepth = a.file_path.split('/').length;
      const bDepth = b.file_path.split('/').length;
      return aDepth - bDepth;
    });

    sortedFiles.forEach(file => {
      const node: FileTreeNode = {
        file,
        children: [],
        expanded: expandedFolders.has(file.id)
      };
      nodeMap.set(file.file_path, node);

      const parentPath = file.parent_path;
      if (!parentPath || parentPath === '/') {
        rootNodes.push(node);
      } else {
        const parentNode = nodeMap.get(parentPath);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          rootNodes.push(node);
        }
      }
    });

    return rootNodes;
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleDragStart = (file: ProjectFile) => {
    setDraggedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetFile: ProjectFile) => {
    if (!draggedFile || draggedFile.id === targetFile.id) return;
    
    // Only allow dropping into folders or root
    if (!targetFile.is_directory) return;

    try {
      const newParentPath = targetFile.file_path;
      const newFilePath = `${newParentPath}/${draggedFile.file_name}`;

      // @ts-ignore
      await supabase
        .from("project_files")
        .update({ 
          parent_path: newParentPath,
          file_path: newFilePath 
        })
        .eq("id", draggedFile.id);

      toast({
        title: "تم النقل",
        description: "تم نقل الملف بنجاح",
      });

      loadFiles();
    } catch (error) {
      console.error("Error moving file:", error);
      toast({
        title: "خطأ",
        description: "فشل نقل الملف",
        variant: "destructive",
      });
    } finally {
      setDraggedFile(null);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;

    setCreating(true);
    try {
      const filePath = newFileName.startsWith("/") ? newFileName : `/${newFileName}`;
      const fileName = filePath.split("/").pop() || newFileName;

      // Get project slug and discord_id
      // @ts-ignore
      const { data: projectData } = await supabase
        .from("projects")
        .select("url_slug, user_id")
        .eq("id", projectId)
        .single();

      if (!projectData) throw new Error("Project not found");

      // @ts-ignore
      const { data: profile } = await supabase
        .from("profiles")
        .select("discord_id")
        .eq("id", projectData.user_id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const projectSlug = projectData.url_slug.split("/")[1];
      const storagePath = `${profile.discord_id}/${projectSlug}${filePath}`;

      // Upload to storage if not a directory
      if (!isDirectory) {
        const blob = new Blob([""], { type: "text/plain" });
        const { error: uploadError } = await supabase.storage
          .from("project-files")
          .upload(storagePath, blob, { upsert: true });

        if (uploadError) throw uploadError;
      }

      // @ts-ignore
      const { data, error } = await supabase
        .from("project_files")
        .insert({
          project_id: projectId,
          file_name: fileName,
          file_path: filePath,
          content: isDirectory ? null : "",
          is_directory: isDirectory,
        })
        .select()
        .single();

      if (error) throw error;

      // Track modification
      // @ts-ignore
      await supabase.from("file_modifications").insert({
        project_id: projectId,
        file_id: data.id,
        file_name: fileName,
        file_path: filePath,
        modification_type: "created",
        new_content: isDirectory ? null : "",
      });

      toast({
        title: "تم الإنشاء",
        description: `تم إنشاء ${isDirectory ? "المجلد" : "الملف"} بنجاح`,
      });

      setShowNewFileDialog(false);
      setNewFileName("");
      setIsDirectory(false);
      loadFiles();
    } catch (error) {
      console.error("Error creating file:", error);
      toast({
        title: "خطأ",
        description: "فشل إنشاء الملف",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFile = async (file: ProjectFile) => {
    try {
      // @ts-ignore
      const { error } = await supabase
        .from("project_files")
        .delete()
        .eq("id", file.id);

      if (error) throw error;

      // Track modification
      // @ts-ignore
      await supabase.from("file_modifications").insert({
        project_id: projectId,
        file_id: file.id,
        file_name: file.file_name,
        file_path: file.file_path,
        modification_type: "deleted",
        old_content: file.content,
      });

      toast({
        title: "تم الحذف",
        description: "تم حذف الملف بنجاح",
      });

      if (selectedFile?.id === file.id) {
        setSelectedFile(null);
        setEditorContent("");
      }

      loadFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "خطأ",
        description: "فشل حذف الملف",
        variant: "destructive",
      });
    }
  };

  const handleRenameFile = async () => {
    if (!renameFile || !newName.trim()) return;

    try {
      const newPath = renameFile.file_path.replace(renameFile.file_name, newName);

      // @ts-ignore
      const { error } = await supabase
        .from("project_files")
        .update({ file_name: newName, file_path: newPath })
        .eq("id", renameFile.id);

      if (error) throw error;

      // Track modification
      // @ts-ignore
      await supabase.from("file_modifications").insert({
        project_id: projectId,
        file_id: renameFile.id,
        file_name: newName,
        file_path: newPath,
        modification_type: "renamed",
        old_name: renameFile.file_name,
      });

      toast({
        title: "تم إعادة التسمية",
        description: "تم إعادة تسمية الملف بنجاح",
      });

      setRenameFile(null);
      setNewName("");
      loadFiles();
    } catch (error) {
      console.error("Error renaming file:", error);
      toast({
        title: "خطأ",
        description: "فشل إعادة تسمية الملف",
        variant: "destructive",
      });
    }
  };

  const handleUploadZip = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith(".zip")) {
      toast({
        title: "خطأ",
        description: "الرجاء رفع ملف ZIP فقط",
        variant: "destructive",
      });
      return;
    }

    setExtracting(true);
    setExtractProgress(0);

    try {
      // Get project slug and discord_id
      // @ts-ignore
      const { data: projectData } = await supabase
        .from("projects")
        .select("url_slug, user_id")
        .eq("id", projectId)
        .single();

      if (!projectData) throw new Error("Project not found");

      // @ts-ignore
      const { data: profile } = await supabase
        .from("profiles")
        .select("discord_id")
        .eq("id", projectData.user_id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const projectSlug = projectData.url_slug.split("/")[1];

      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const fileEntries = Object.keys(contents.files);
      let processed = 0;

      for (const fileName of fileEntries) {
        const fileData = contents.files[fileName];
        
        // Skip __MACOSX and hidden files
        if (fileName.includes('__MACOSX') || fileName.startsWith('.')) {
          processed++;
          setExtractProgress(Math.round((processed / fileEntries.length) * 100));
          continue;
        }
        
        // Handle directories
        if (fileData.dir) {
          const dirPath = `/${fileName.replace(/\/$/, '')}`;
          const dirName = fileName.split("/").filter(Boolean).pop() || fileName;
          
          // @ts-ignore
          await supabase.from("project_files").insert({
            project_id: projectId,
            file_name: dirName,
            file_path: dirPath,
            content: null,
            is_directory: true,
          });
          processed++;
          setExtractProgress(Math.round((processed / fileEntries.length) * 100));
          continue;
        }

        const content = await fileData.async("text");
        const filePath = `/${fileName}`;
        const name = fileName.split("/").pop() || fileName;
        const parentPath = fileName.includes('/') ? `/${fileName.substring(0, fileName.lastIndexOf('/'))}` : null;
        const storagePath = `${profile.discord_id}/${projectSlug}${filePath}`;

        // Upload to storage
        const blob = new Blob([content], { type: "text/plain" });
        await supabase.storage
          .from("project-files")
          .upload(storagePath, blob, { upsert: true });

        // @ts-ignore
        const { data, error } = await supabase
          .from("project_files")
          .insert({
            project_id: projectId,
            file_name: name,
            file_path: filePath,
            parent_path: parentPath,
            content: content,
            is_directory: false,
          })
          .select()
          .single();

        if (!error && data) {
          // Track modification
          // @ts-ignore
          await supabase.from("file_modifications").insert({
            project_id: projectId,
            file_id: data.id,
            file_name: name,
            file_path: filePath,
            modification_type: "created",
            new_content: content,
          });
        }

        processed++;
        setExtractProgress(Math.round((processed / fileEntries.length) * 100));
      }

      toast({
        title: "تم الاستخراج",
        description: "تم استخراج الملفات بنجاح",
      });

      loadFiles();
    } catch (error) {
      console.error("Error extracting zip:", error);
      toast({
        title: "خطأ",
        description: "فشل استخراج الملفات",
        variant: "destructive",
      });
    } finally {
      setExtracting(false);
      setExtractProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExtractZipFile = async (file: ProjectFile) => {
    if (!file.content) return;

    setExtracting(true);
    setExtractProgress(0);

    try {
      // Get project slug and discord_id
      // @ts-ignore
      const { data: projectData } = await supabase
        .from("projects")
        .select("url_slug, user_id")
        .eq("id", projectId)
        .single();

      if (!projectData) throw new Error("Project not found");

      // @ts-ignore
      const { data: profile } = await supabase
        .from("profiles")
        .select("discord_id")
        .eq("id", projectData.user_id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const projectSlug = projectData.url_slug.split("/")[1];

      const zip = new JSZip();
      const contents = await zip.loadAsync(file.content);
      const fileEntries = Object.keys(contents.files);
      let processed = 0;

      const basePath = file.file_path.replace(file.file_name, "");

      for (const fileName of fileEntries) {
        const fileData = contents.files[fileName];
        
        // Skip __MACOSX and hidden files
        if (fileName.includes('__MACOSX') || fileName.startsWith('.')) {
          processed++;
          setExtractProgress(Math.round((processed / fileEntries.length) * 100));
          continue;
        }
        
        // Handle directories
        if (fileData.dir) {
          const dirPath = `${basePath}${fileName.replace(/\/$/, '')}`;
          const dirName = fileName.split("/").filter(Boolean).pop() || fileName;
          
          // @ts-ignore
          await supabase.from("project_files").insert({
            project_id: projectId,
            file_name: dirName,
            file_path: dirPath,
            content: null,
            is_directory: true,
          });
          processed++;
          setExtractProgress(Math.round((processed / fileEntries.length) * 100));
          continue;
        }

        const content = await fileData.async("text");
        const filePath = `${basePath}${fileName}`;
        const name = fileName.split("/").pop() || fileName;
        const parentPath = fileName.includes('/') ? `${basePath}${fileName.substring(0, fileName.lastIndexOf('/'))}` : basePath.replace(/\/$/, '') || null;
        const storagePath = `${profile.discord_id}/${projectSlug}${filePath}`;

        // Upload to storage
        const blob = new Blob([content], { type: "text/plain" });
        await supabase.storage
          .from("project-files")
          .upload(storagePath, blob, { upsert: true });

        // @ts-ignore
        const { data, error } = await supabase
          .from("project_files")
          .insert({
            project_id: projectId,
            file_name: name,
            file_path: filePath,
            parent_path: parentPath,
            content: content,
            is_directory: false,
          })
          .select()
          .single();

        if (!error && data) {
          // @ts-ignore
          await supabase.from("file_modifications").insert({
            project_id: projectId,
            file_id: data.id,
            file_name: name,
            file_path: filePath,
            modification_type: "created",
            new_content: content,
          });
        }

        processed++;
        setExtractProgress(Math.round((processed / fileEntries.length) * 100));
      }

      toast({
        title: "تم الاستخراج",
        description: "تم استخراج الملفات بنجاح",
      });

      loadFiles();
    } catch (error) {
      console.error("Error extracting zip file:", error);
      toast({
        title: "خطأ",
        description: "فشل استخراج الملفات",
        variant: "destructive",
      });
    } finally {
      setExtracting(false);
      setExtractProgress(0);
    }
  };

  const renderFileTree = (nodes: FileTreeNode[], depth: number = 0): JSX.Element[] => {
    return nodes.map(node => (
      <div key={node.file.id}>
        <div
          draggable={!node.file.is_directory}
          onDragStart={() => handleDragStart(node.file)}
          onDragOver={handleDragOver}
          onDrop={() => node.file.is_directory && handleDrop(node.file)}
          onClick={(e) => {
            e.stopPropagation();
            if (node.file.is_directory) {
              toggleFolder(node.file.id);
            } else {
              handleFileClick(node.file);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenu({ x: e.clientX, y: e.clientY, file: node.file });
          }}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
          className={`
            flex items-center gap-2 py-2 pr-3 rounded-lg cursor-pointer mb-1
            hover:bg-accent/50 transition-all duration-200
            ${selectedFile?.id === node.file.id ? "bg-accent" : ""}
            ${draggedFile?.id === node.file.id ? "opacity-50" : ""}
          `}
        >
          {node.file.is_directory && (
            <span className="text-muted-foreground">
              {expandedFolders.has(node.file.id) ? (
                <FaChevronDown className="w-3 h-3" />
              ) : (
                <FaChevronRight className="w-3 h-3" />
              )}
            </span>
          )}
          {node.file.is_directory ? (
            expandedFolders.has(node.file.id) ? (
              <FaFolderOpen className="w-4 h-4 text-yellow-500" />
            ) : (
              <FaFolder className="w-4 h-4 text-yellow-500" />
            )
          ) : node.file.file_name.endsWith(".zip") ? (
            <FaFileArchive className="w-4 h-4 text-purple-500" />
          ) : (
            getFileIcon(node.file.file_name, node.file.is_directory)
          )}
          <span className="text-sm truncate flex-1">{node.file.file_name}</span>
        </div>
        {node.file.is_directory && expandedFolders.has(node.file.id) && node.children.length > 0 && (
          <div>
            {renderFileTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const fileTree = buildFileTree(files);

  return (
    <>
      <div className="h-full flex">
        {/* File Tree */}
        <div className="w-64 border-r border-border bg-card/30 flex flex-col">
          <div className="p-4 border-b border-border flex gap-2">
            <Button size="sm" onClick={() => setShowNewFileDialog(true)} className="flex-1 gap-2">
              <FaPlus className="w-3 h-3" />
              جديد
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <FaUpload className="w-3 h-3" />
              ZIP
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleUploadZip}
              className="hidden"
            />
          </div>

          <div className="flex-1 overflow-auto p-2">
            {renderFileTree(fileTree)}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedFile ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between bg-card/30 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <FaFile className="w-4 h-4 text-primary" />
                  <span className="font-medium">{selectedFile.file_name}</span>
                </div>
                <Button onClick={handleSaveFile} size="sm" className="gap-2">
                  <FaDownload className="w-3 h-3" />
                  حفظ
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <CodeEditor
                  value={editorContent}
                  onChange={setEditorContent}
                  language={getLanguageFromFileName(selectedFile.file_name)}
                />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FaFolder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>اختر ملفاً للتحرير</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-card border border-border rounded-lg shadow-lg py-1 z-50 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.file.file_name.endsWith(".zip") && (
            <button
              onClick={() => {
                handleExtractZipFile(contextMenu.file);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-right hover:bg-accent flex items-center gap-2"
            >
              <FaFileArchive className="w-4 h-4" />
              استخراج الملفات
            </button>
          )}
          <button
            onClick={() => {
              setRenameFile(contextMenu.file);
              setNewName(contextMenu.file.file_name);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-right hover:bg-accent flex items-center gap-2"
          >
            <FaEdit className="w-4 h-4" />
            إعادة تسمية
          </button>
          <button
            onClick={() => {
              handleDeleteFile(contextMenu.file);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-right hover:bg-destructive/20 text-destructive flex items-center gap-2"
          >
            <FaTrash className="w-4 h-4" />
            حذف
          </button>
        </div>
      )}

      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={(open) => !creating && setShowNewFileDialog(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء ملف أو مجلد جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="اسم الملف (مثال: index.html أو /folder/file.js)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                disabled={creating}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDirectory(!isDirectory)}
                  disabled={creating}
                  className={`
                    w-6 h-6 rounded border-2 transition-all duration-200
                    flex items-center justify-center flex-shrink-0
                    ${isDirectory 
                      ? 'bg-primary border-primary scale-100' 
                      : 'border-input hover:border-primary/50 scale-90'
                    }
                    ${creating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-100'}
                  `}
                >
                  {isDirectory && (
                    <Check className="w-4 h-4 text-primary-foreground animate-scale-in" />
                  )}
                </button>
                <span className="text-sm text-muted-foreground">مجلد؟</span>
              </div>
            </div>
            <div className="flex gap-2">
              {creating ? (
                <div className="flex-1 flex items-center justify-center py-2 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">جاري الإنشاء...</span>
                </div>
              ) : (
                <>
                  <Button onClick={handleCreateFile} className="flex-1" disabled={creating}>
                    إنشاء
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewFileDialog(false)} className="flex-1" disabled={creating}>
                    إلغاء
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameFile} onOpenChange={() => setRenameFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إعادة تسمية الملف</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="الاسم الجديد"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleRenameFile} className="flex-1">
                حفظ
              </Button>
              <Button variant="outline" onClick={() => setRenameFile(null)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Extraction Progress Dialog */}
      <Dialog open={extracting} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>جاري استخراج الملفات</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{extractProgress}%</p>
              <p className="text-sm text-muted-foreground mt-2">يرجى الانتظار...</p>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${extractProgress}%` }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FilesTab;
