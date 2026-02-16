"use client";

import React, { useState, useEffect } from "react";
import {
  getUploadUrl,
  listFiles,
  deleteFile,
  getFileMeta,
  type OSSFile,
  type OSSFileMeta,
} from "@/lib/service/oss";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Loader2,
  Trash2,
  Upload,
  File as FileIcon,
  RefreshCw,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OSSTestPage() {
  const [files, setFiles] = useState<OSSFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileToDelete, setFileToDelete] = useState<OSSFile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileMeta, setFileMeta] = useState<OSSFileMeta | null>(null);
  const [currentMetaFile, setCurrentMetaFile] = useState<OSSFile | null>(null);
  const [metaDialogOpen, setMetaDialogOpen] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await listFiles();
      // Sort by last modified desc
      const sortedData = [...data].sort((a, b) => {
        if (!a.LastModified || !b.LastModified) return 0;
        return (
          new Date(b.LastModified).getTime() -
          new Date(a.LastModified).getTime()
        );
      });
      setFiles(sortedData);
    } catch (error) {
      console.error(error);
      toast.error("获取文件列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);

    try {
      // 1. Get signed URL
      const { url } = await getUploadUrl(selectedFile.name, selectedFile.type);

      // 2. Upload file directly to OSS
      const response = await fetch(url, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast.success(`文件 ${selectedFile.name} 上传成功`);
      setSelectedFile(null);
      // Reset input manually if needed, but form reset handles it
      (e.target as HTMLFormElement).reset();
      fetchFiles();
    } catch (error) {
      console.error(error);
      toast.error("文件上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (file: OSSFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    const key = fileToDelete.Key;

    // Optimistic update
    const previousFiles = [...files];
    setFiles(files.filter((f) => f.Key !== key));
    setDeleteDialogOpen(false);

    try {
      await deleteFile(key);
      toast.success("文件删除成功");
    } catch (error) {
      console.error(error);
      toast.error("删除文件失败");
      // Rollback
      setFiles(previousFiles);
    } finally {
      setFileToDelete(null);
    }
  };

  const handleViewMeta = async (file: OSSFile) => {
    setCurrentMetaFile(file);
    setMetaLoading(true);
    setMetaDialogOpen(true);
    setFileMeta(null); // Clear previous meta
    try {
      const meta = await getFileMeta(file.Key);
      setFileMeta(meta);
    } catch (error) {
      console.error(error);
      toast.error("获取文件元数据失败");
      setMetaDialogOpen(false);
    } finally {
      setMetaLoading(false);
    }
  };

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "未知大小";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">OSS 存储测试</h1>
          <p className="text-muted-foreground mt-2">
            在配置的对象存储服务中上传、列出和管理文件。
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            上传文件
          </CardTitle>
          <CardDescription>选择要上传到存储桶根目录的文件。</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleUpload}
            className="flex flex-col sm:flex-row gap-4 items-end"
          >
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="file">文件</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
            <Button type="submit" disabled={!selectedFile || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  上传
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileIcon className="w-5 h-5" />
              文件列表
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFiles}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              刷新
            </Button>
          </div>
          <CardDescription>存储桶中的当前文件。</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && files.length === 0 ? (
            <div className="flex justify-center items-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="sr-only">加载中...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <FileIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>存储桶中未找到文件</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm text-muted-foreground">
                <div className="col-span-6 sm:col-span-5">名称</div>
                <div className="col-span-3 sm:col-span-2 text-right">大小</div>
                <div className="col-span-3 sm:col-span-3 text-right">
                  最后修改时间
                </div>
                <div className="col-span-3 sm:col-span-2 text-right">操作</div>
              </div>
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.Key}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors text-sm"
                  >
                    <div
                      className="col-span-6 sm:col-span-5 font-medium truncate flex items-center gap-2"
                      title={file.Key}
                    >
                      <FileIcon className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate">{file.Key}</span>
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-right text-muted-foreground font-mono text-xs">
                      {formatSize(file.Size)}
                    </div>
                    <div className="col-span-3 sm:col-span-3 text-right text-muted-foreground text-xs truncate">
                      {file.LastModified
                        ? new Date(file.LastModified).toLocaleString()
                        : "-"}
                    </div>
                    <div className="col-span-3 sm:col-span-2 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="查看元数据"
                        onClick={() => handleViewMeta(file)}
                      >
                        <Info className="w-4 h-4 text-gray-500" />
                      </Button>
                      {file.Url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="打开/下载"
                        >
                          <a
                            href={file.Url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(file)}
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground border-t pt-4">
          总计: {files.length} 个文件
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除此文件吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久从您的 OSS 存储桶中删除文件{" "}
              <span className="font-semibold text-foreground">
                {fileToDelete?.Key}
              </span>
              。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={metaDialogOpen} onOpenChange={setMetaDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>文件元数据</DialogTitle>
            <DialogDescription>
              查看文件 {currentMetaFile?.Key} 的详细信息
            </DialogDescription>
          </DialogHeader>
          {metaLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : fileMeta ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">文件类型</Label>
                <div className="col-span-3 text-sm font-mono">
                  {fileMeta.ContentType}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">文件大小</Label>
                <div className="col-span-3 text-sm font-mono">
                  {formatSize(fileMeta.ContentLength)}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">最后修改时间</Label>
                <div className="col-span-3 text-sm font-mono">
                  {fileMeta.LastModified
                    ? new Date(fileMeta.LastModified).toLocaleString()
                    : "-"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ETag</Label>
                <div className="col-span-3 text-sm font-mono truncate">
                  {fileMeta.ETag?.replace(/"/g, "")}
                </div>
              </div>
              {fileMeta.Metadata &&
                Object.keys(fileMeta.Metadata).length > 0 && (
                  <div className="border-t pt-4 mt-2">
                    <Label className="mb-2 block">自定义元数据</Label>
                    {Object.entries(fileMeta.Metadata).map(([key, value]) => (
                      <div
                        key={key}
                        className="grid grid-cols-4 items-center gap-4 mb-2"
                      >
                        <Label className="text-right text-xs text-muted-foreground">
                          {key}
                        </Label>
                        <div className="col-span-3 text-sm font-mono">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              暂无元数据信息
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
