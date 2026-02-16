"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Copy,
  Eraser,
  Binary,
  ImageIcon,
  Type,
  Upload,
  Link as LinkIcon,
  X,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";
import { getEmbedding, getImageEmbedding } from "@/lib/service/embedding";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function EmbeddingPage() {
  const [activeTab, setActiveTab] = useState("text");
  const [imageTab, setImageTab] = useState("upload"); // 'upload' | 'url'
  const [inputText, setInputText] = useState(
    "一种基于区块链的供应链金融数据存证方法",
  );
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [imageInput, setImageInput] = useState("");
  const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!inputText) {
      toast.error("缺少输入文本", {
        description: "请输入需要转换的文本",
      });
      return;
    }

    setIsLoading(true);
    setEmbedding(null);

    try {
      const result = await getEmbedding(inputText);
      setEmbedding(result);
      toast.success("生成完成", {
        description: `成功生成 ${result.length} 维向量`,
      });
    } catch (error) {
      console.error(error);
      toast.error("生成出错", {
        description: "请检查控制台日志或稍后重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!embedding) return;
    navigator.clipboard.writeText(JSON.stringify(embedding));
    toast.success("已复制", {
      description: "向量数据已复制到剪贴板",
    });
  };

  const handleGenerateImageEmbedding = async () => {
    if (!imageInput) {
      toast.error("缺少图片输入", {
        description: "请上传图片或输入图片 URL",
      });
      return;
    }

    setIsImageLoading(true);
    setImageEmbedding(null);

    try {
      const result = await getImageEmbedding(imageInput);
      setImageEmbedding(result);
      toast.success("生成完成", {
        description: `成功生成 ${result.length} 维向量`,
      });
    } catch (error) {
      console.error(error);
      toast.error("生成出错", {
        description: "请检查控制台日志或稍后重试",
      });
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleCopyImage = () => {
    if (!imageEmbedding) return;
    navigator.clipboard.writeText(JSON.stringify(imageEmbedding));
    toast.success("已复制", {
      description: "向量数据已复制到剪贴板",
    });
  };

  const handleClear = () => {
    if (activeTab === "text") {
      setInputText("");
      setEmbedding(null);
    } else {
      setImageInput("");
      setImageEmbedding(null);
    }
    toast.success("已清空当前面板");
  };

  // Image Upload Handlers
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("文件格式错误", { description: "请上传图片文件" });
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error("文件过大", { description: "图片大小不能超过 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageInput(result);
      toast.success("图片加载成功");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            e.preventDefault(); // Prevent default paste behavior
          }
          break;
        }
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-6xl mx-auto w-full h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight">Embedding 测试</h2>
          <p className="text-muted-foreground text-sm">
            测试文本和图片的多模态向量生成能力
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={isLoading || isImageLoading}
        >
          <Eraser className="mr-2 h-4 w-4" />
          清空当前
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col h-full space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="text" className="gap-2">
            <Type className="h-4 w-4" />
            文本向量
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            图片向量
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="flex-1 mt-0 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* 左侧：输入区域 */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle>输入文本</CardTitle>
                <CardDescription>
                  输入需要转换为向量的文本内容，支持中文和英文。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="inputText">
                    文本内容 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="inputText"
                    placeholder="请输入文本..."
                    className="min-h-[200px] resize-none focus-visible:ring-offset-0"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        正在生成...
                      </>
                    ) : (
                      <>
                        <Binary className="mr-2 h-4 w-4" />
                        生成向量
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 右侧：输出区域 */}
            <Card className="flex flex-col h-full bg-muted/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>向量结果</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!embedding || isLoading}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制 JSON
                </Button>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-2">
                <div className="h-full rounded-md border bg-background p-4 overflow-y-auto shadow-sm">
                  {embedding ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-2">
                        <span>维度: {embedding.length}</span>
                        <span>类型: float32[]</span>
                      </div>
                      <div className="font-mono text-xs break-all text-muted-foreground">
                        <p className="mb-2 text-foreground font-semibold">
                          前 10 维预览:
                        </p>
                        [{embedding.slice(0, 10).join(", ")}, ... ]
                      </div>
                      <div className="mt-4">
                        <p className="mb-2 text-foreground font-semibold text-xs">
                          完整数据 (前 1000 字符):
                        </p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                          {JSON.stringify(embedding).slice(0, 1000)}
                          {JSON.stringify(embedding).length > 1000 && "..."}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                      <Binary className="h-12 w-12" />
                      <p>在左侧输入文本并点击生成...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="image" className="flex-1 mt-0 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle>输入图片</CardTitle>
                <CardDescription>
                  支持拖拽上传、粘贴图片或输入图片 URL。
                  <br />
                  <span className="text-xs text-muted-foreground">
                    支持格式: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG。单张图片最大
                    5MB。
                    <br />
                    模型: DashScope Multimodal Embedding (v1)
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 overflow-y-auto flex flex-col">
                <Tabs
                  value={imageTab}
                  onValueChange={setImageTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upload" className="gap-2">
                      <Upload className="h-4 w-4" />
                      本地上传
                    </TabsTrigger>
                    <TabsTrigger value="url" className="gap-2">
                      <LinkIcon className="h-4 w-4" />
                      图片 URL
                    </TabsTrigger>
                  </TabsList>

                  <div className="space-y-4">
                    {/* 图片预览区域 */}
                    {imageInput ? (
                      <div className="relative rounded-lg border bg-muted/10 overflow-hidden group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setImageInput("");
                              setImageEmbedding(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="p-4 flex justify-center items-center min-h-[200px]">
                          <img
                            src={imageInput}
                            alt="preview"
                            className="max-h-[300px] max-w-full object-contain shadow-sm rounded-md"
                            onError={(e) => {
                              // @ts-ignore
                              e.target.style.display = "none";
                              toast.error("图片加载失败", {
                                description: "请检查 URL 或文件格式",
                              });
                            }}
                          />
                        </div>
                        <div className="px-3 py-2 bg-muted/50 text-xs text-muted-foreground border-t flex justify-between items-center">
                          <span className="truncate max-w-[80%]">
                            {imageInput.startsWith("data:")
                              ? "Base64 Image Data"
                              : imageInput}
                          </span>
                          <span>
                            {imageInput.length > 1000
                              ? `${(imageInput.length / 1024).toFixed(1)} KB`
                              : `${imageInput.length} chars`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="min-h-[200px] flex flex-col">
                        <TabsContent
                          value="upload"
                          className="mt-0 h-full flex-1"
                        >
                          <div
                            className={cn(
                              "h-full min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors p-8 text-center",
                              isDragging
                                ? "border-primary bg-primary/10"
                                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/5",
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            onPaste={handlePaste}
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                            <div className="rounded-full bg-muted p-4 mb-4">
                              <ImagePlus className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">
                              点击或拖拽上传图片
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              支持 JPG, PNG, WebP 等格式
                            </p>
                            <p className="text-xs text-muted-foreground/50">
                              也支持直接 Ctrl+V 粘贴图片
                            </p>
                          </div>
                        </TabsContent>

                        <TabsContent value="url" className="mt-0 h-full flex-1">
                          <div className="h-full min-h-[200px] flex flex-col justify-center gap-4 p-8 border rounded-lg bg-muted/5">
                            <div className="space-y-2 w-full">
                              <Label htmlFor="imageUrlInput">图片链接</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="imageUrlInput"
                                  placeholder="https://example.com/image.jpg"
                                  value={imageInput}
                                  onChange={(e) =>
                                    setImageInput(e.target.value)
                                  }
                                  className="flex-1"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                请输入公开可访问的图片 URL
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                      </div>
                    )}
                  </div>
                </Tabs>

                <div className="pt-4 mt-auto">
                  <Button
                    className="w-full"
                    onClick={handleGenerateImageEmbedding}
                    disabled={isImageLoading || !imageInput}
                  >
                    {isImageLoading ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        正在生成...
                      </>
                    ) : (
                      <>
                        <Binary className="mr-2 h-4 w-4" />
                        生成向量
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-full bg-muted/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>图片向量结果</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyImage}
                  disabled={!imageEmbedding || isImageLoading}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制 JSON
                </Button>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-2">
                <div className="h-full rounded-md border bg-background p-4 overflow-y-auto shadow-sm">
                  {imageEmbedding ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-2">
                        <span>维度: {imageEmbedding.length}</span>
                        <span>类型: float32[]</span>
                      </div>
                      <div className="font-mono text-xs break-all text-muted-foreground">
                        <p className="mb-2 text-foreground font-semibold">
                          前 10 维预览:
                        </p>
                        [{imageEmbedding.slice(0, 10).join(", ")}, ... ]
                      </div>
                      <div className="mt-4">
                        <p className="mb-2 text-foreground font-semibold text-xs">
                          完整数据 (前 1000 字符):
                        </p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                          {JSON.stringify(imageEmbedding).slice(0, 1000)}
                          {JSON.stringify(imageEmbedding).length > 1000 &&
                            "..."}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                      <Binary className="h-12 w-12" />
                      <p>在左侧上传图片并点击生成...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
