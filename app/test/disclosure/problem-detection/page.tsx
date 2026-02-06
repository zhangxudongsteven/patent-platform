"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
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
import { Sparkles, Copy, Eraser, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function ProblemDetectionPage() {
  const [technicalSolution, setTechnicalSolution] = useState(
    "本发明提出一种基于区块链的供应链金融数据存证方法，包括：\n\n1. 构建联盟链网络，实现多方参与的去中心化数据存储；\n2. 采用智能合约自动执行数据存证流程，确保流程透明可追溯；\n3. 引入零知识证明技术，在保护数据隐私的同时实现数据验证；\n4. 设计分层存储架构，将敏感数据加密存储在私有链，公开哈希存储在公有链。",
  );

  const { completion, complete, isLoading, stop, setCompletion } =
    useCompletion({
      api: "/api/disclosure/problem-detection",
      streamProtocol: "text",
      onFinish: () => {
        toast.success("检测完成", {
          description: "技术方案问题已成功检测",
        });
      },
      onError: (error: Error) => {
        console.error(error);
        toast.error("检测出错", {
          description: "请稍后重试",
        });
      },
    });

  const handleGenerate = async () => {
    if (!technicalSolution.trim()) {
      toast.error("缺少必要信息", {
        description: "请填写技术方案",
      });
      return;
    }

    try {
      await complete("", {
        body: {
          technicalSolution,
        },
      });
    } catch (error) {
      console.error("检测失败:", error);
      toast.error("检测失败", {
        description: "请稍后重试",
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(completion);
      toast.success("已复制", {
        description: "内容已复制到剪贴板",
      });
    } catch (error) {
      console.error("复制失败:", error);
      toast.error("复制失败", {
        description: "请手动复制内容",
      });
    }
  };

  const handleClear = () => {
    setTechnicalSolution("");
    stop();
    setCompletion("");
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-6xl mx-auto w-full h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <h2 className="text-3xl font-bold tracking-tight">问题检测</h2>
        <Button variant="outline" onClick={handleClear} disabled={isLoading}>
          <Eraser className="mr-2 h-4 w-4" />
          清空重置
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>输入信息</CardTitle>
            <CardDescription>
              提供专利技术方案，AI 将为您检测技术方案中存在的问题。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="technicalSolution">
                技术方案 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="technicalSolution"
                placeholder="请输入技术方案，描述本发明的核心创新点和实现方式..."
                className="min-h-[400px] resize-none"
                value={technicalSolution}
                onChange={(e) => setTechnicalSolution(e.target.value)}
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
                    正在检测...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始检测
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>检测结果</CardTitle>
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
                  <AlertTriangle className="h-12 w-12" />
                  <p>在左侧填写技术方案并点击检测...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
