"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Sparkles, Copy, Eraser } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function BackgroundGenerationPage() {
  const [inventionName, setInventionName] = useState(
    "一种基于区块链的供应链金融数据存证方法",
  );
  const [technicalField, setTechnicalField] = useState("区块链技术与金融科技");
  const [existingProblems, setExistingProblems] = useState(
    "现有供应链金融数据存证主要依赖中心化数据库，存在数据易被篡改、多方协作信任成本高、隐私保护不足等问题。同时，传统纸质单据流转效率低，难以实现实时对账。",
  );

  const { completion, complete, isLoading, stop, setCompletion } =
    useCompletion({
      api: "/api/disclosure/background-generation",
      streamProtocol: "text",
      onFinish: () => {
        toast.success("生成完成", {
          description: "技术背景已成功生成",
        });
      },
      onError: (error: Error) => {
        console.error(error);
        toast.error("生成出错", {
          description: "请稍后重试",
        });
      },
    });

  const handleGenerate = async () => {
    if (!inventionName || !technicalField) {
      toast.error("缺少必要信息", {
        description: "请填写发明名称和技术领域",
      });
      return;
    }

    try {
      await complete("", {
        body: {
          inventionName,
          technicalField,
          existingProblems,
        },
      });
    } catch (error) {
      // Error is handled in onError
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(completion);
    toast.success("已复制", {
      description: "内容已复制到剪贴板",
    });
  };

  const handleClear = () => {
    setInventionName("");
    setTechnicalField("");
    setExistingProblems("");
    stop();
    setCompletion("");
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-6xl mx-auto w-full h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <h2 className="text-3xl font-bold tracking-tight">技术背景生成</h2>
        <Button variant="outline" onClick={handleClear} disabled={isLoading}>
          <Eraser className="mr-2 h-4 w-4" />
          清空重置
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* 左侧：输入区域 */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>输入信息</CardTitle>
            <CardDescription>
              提供发明的基本信息和现有技术的痛点，AI
              将为您生成专业的背景技术描述。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="inventionName">
                发明名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="inventionName"
                placeholder="例如：一种基于深度学习的图像识别方法"
                value={inventionName}
                onChange={(e) => setInventionName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalField">
                技术领域 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="technicalField"
                placeholder="例如：计算机视觉与人工智能"
                value={technicalField}
                onChange={(e) => setTechnicalField(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="existingProblems">现有技术问题/缺点</Label>
              <Textarea
                id="existingProblems"
                placeholder="简要描述现有技术存在的问题，例如：识别准确率低、计算速度慢..."
                className="min-h-[150px] resize-none"
                value={existingProblems}
                onChange={(e) => setExistingProblems(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                提示：列出的问题越具体，生成的背景描述越有针对性。
              </p>
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
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始生成
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：输出区域 */}
        <Card className="flex flex-col h-full bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>生成结果</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!completion || isLoading}
            >
              <Copy className="h-4 w-4 mr-2" />
              复制
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-6 pt-2">
            <div className="h-full rounded-md border bg-background p-4 overflow-y-auto shadow-sm">
              {completion ? (
                <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed">
                  <ReactMarkdown>{completion}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                  <Sparkles className="h-12 w-12" />
                  <p>在左侧填写信息并点击生成...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
