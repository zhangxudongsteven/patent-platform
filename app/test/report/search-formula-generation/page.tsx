"use client";

import { useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Copy, Eraser, Info, Search } from "lucide-react";
import { toast } from "sonner";

export default function SearchFormulaTestPage() {
  const [ipcCodes, setIpcCodes] = useState("G06F\nG06N");
  const [keywords, setKeywords] = useState("人工智能\n深度学习");
  const [result, setResult] = useState<{
    format1: string;
    format2: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("format1");

  const handleGenerate = async () => {
    if (!keywords.trim()) {
      toast.error("请输入关键词");
      return;
    }

    if (!ipcCodes.trim()) {
      toast.error("请输入IPC/CPC分类号");
      return;
    }

    const keywordList = keywords
      .split(/[，、,\n]/)
      .map((k) => k.trim())
      .filter((k) => k);
    const ipcList = ipcCodes
      .split(/[，、,\n]/)
      .map((k) => k.trim())
      .filter((k) => k);

    if (keywordList.length === 0) {
      toast.error("请输入有效的关键词");
      return;
    }

    if (ipcList.length === 0) {
      toast.error("请输入有效的IPC/CPC分类号");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const [response1, response2] = await Promise.all([
        fetch("/api/report/search-formula-generation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keywords: keywordList,
            ipcCodes: ipcList,
            outputFormat: "format1",
          }),
        }),
        fetch("/api/report/search-formula-generation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keywords: keywordList,
            ipcCodes: ipcList,
            outputFormat: "format2",
          }),
        }),
      ]);

      const data1 = await response1.json();
      const data2 = await response2.json();

      if (data1.error || data2.error) {
        toast.error(data1.error || data2.error || "生成失败");
      } else {
        setResult({
          format1: data1.formula,
          format2: data2.formula,
        });
        toast.success("生成成功", {
          description: "检索式已生成",
        });
      }
    } catch (err) {
      console.error("请求出错:", err);
      toast.error("网络或服务器错误");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = activeTab === "format1" ? result.format1 : result.format2;
    navigator.clipboard.writeText(text);
    toast.success("已复制", {
      description: "内容已复制到剪贴板",
    });
  };

  const handleClear = () => {
    setIpcCodes("");
    setKeywords("");
    setResult(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-6xl mx-auto w-full h-[calc(100vh-6rem)]">
        <div className="flex items-center justify-between space-y-2 mb-2">
          <h2 className="text-3xl font-bold tracking-tight">专利检索式生成</h2>
          <Button variant="outline" onClick={handleClear} disabled={loading}>
            <Eraser className="mr-2 h-4 w-4" />
            清空重置
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* 左侧输入区 */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>输入信息</CardTitle>
              <CardDescription>
                输入关键词和IPC/CPC分类号，系统将按照Incopat标准生成检索式。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="ipcCodes">
                  IPC/CPC分类号 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="ipcCodes"
                  value={ipcCodes}
                  onChange={(e) => setIpcCodes(e.target.value)}
                  placeholder="例如：&#10;G06F&#10;G06N&#10;A61B"
                  className="min-h-[120px] resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  支持用顿号、逗号或换行分隔
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">
                  关键词 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="例如：&#10;人工智能&#10;医疗诊断&#10;机器学习&#10;深度学习&#10;图像识别"
                  className="min-h-[120px] resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  支持用顿号、逗号或换行分隔
                </p>
              </div>

              <Alert className="bg-muted/50 border-muted">
                <Info className="h-4 w-4" />
                <AlertTitle>使用提示</AlertTitle>
                <AlertDescription className="text-xs mt-1 leading-relaxed">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>格式1包含关键词和IPC/CPC分类号，适合精确检索</li>
                    <li>格式2仅包含关键词，适合广泛检索</li>
                    <li>生成的检索式可直接用于Incopat专利数据库</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="pt-2">
                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      正在生成...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      生成检索式
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 右侧结果区 */}
          <Card className="flex flex-col h-full bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>生成结果</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!result}
              >
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-6 pt-2 overflow-hidden flex flex-col">
              {result ? (
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex flex-col h-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="format1">
                      格式1：关键词 + IPC/CPC
                    </TabsTrigger>
                    <TabsTrigger value="format2">格式2：仅关键词</TabsTrigger>
                  </TabsList>

                  <div className="flex-1 relative overflow-hidden rounded-md border bg-background shadow-sm">
                    <TabsContent value="format1" className="h-full m-0 p-0">
                      <pre className="p-4 h-full overflow-y-auto text-sm whitespace-pre-wrap font-mono">
                        {result.format1}
                      </pre>
                    </TabsContent>

                    <TabsContent value="format2" className="h-full m-0 p-0">
                      <pre className="p-4 h-full overflow-y-auto text-sm whitespace-pre-wrap font-mono">
                        {result.format2}
                      </pre>
                    </TabsContent>
                  </div>
                </Tabs>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                  <Sparkles className="h-12 w-12" />
                  <p>在左侧填写信息并点击生成...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
