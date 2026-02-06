"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Shield,
  Lightbulb,
  AlertTriangle,
  Scale,
  BookOpen,
  Loader2,
  ChevronRight,
  Target,
  Wrench,
  Zap,
} from "lucide-react";

interface AnalysisWorkflowProps {
  fileNames: string[];
  onBack: () => void;
}

interface AnalysisSection {
  title: string;
  icon: React.ReactNode;
  content: string;
  items?: string[];
}

export function AnalysisWorkflow({ fileNames, onBack }: AnalysisWorkflowProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  // 模拟解析过程
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsAnalyzing(false);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const currentFileName = fileNames[selectedFileIndex] || "该文件";

  const analysisSections: AnalysisSection[] = [
    {
      title: "技术问题",
      icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
      content: `本专利（${currentFileName}）主要致力于解决在复杂光照条件下，现有图像识别算法准确率下降以及处理延迟过高的问题。`,
      items: [
        "现有技术中，低光照环境导致图像特征丢失严重。",
        "传统图像增强算法计算复杂度高，难以满足实时性要求。",
      ],
    },
    {
      title: "技术手段",
      icon: <Wrench className="h-5 w-5 text-blue-500" />,
      content: `针对${currentFileName}提出的问题，采用了一种基于深度学习的自适应图像增强与识别联合框架。`,
      items: [
        "引入轻量级注意力机制网络（Lightweight Attention Network）进行特征提取。",
        "设计了动态光照补偿模块，根据输入图像直方图自动调整增强参数。",
        "采用端到端训练策略，联合优化增强模块与识别模块。",
      ],
    },
    {
      title: "技术效果",
      icon: <Zap className="h-5 w-5 text-emerald-500" />,
      content: `通过对${currentFileName}的实施，实现了在保证高识别准确率的同时，显著降低了计算开销。`,
      items: [
        "在低光照测试集上，识别准确率提升了15.3%。",
        "相比传统算法，推理速度提升了2倍，满足移动端实时处理需求。",
        "模型体积减小了40%，便于在资源受限设备上部署。",
      ],
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                专利深度解析
              </h2>
              <p className="text-xs text-muted-foreground">
                {fileNames.length > 1
                  ? `共 ${fileNames.length} 个文件`
                  : fileNames[0]}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Section: Tabs + Results */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* File Tabs - Fixed */}
          <div className="border-b border-border bg-background px-6 pt-6">
            <div className="mx-auto max-w-4xl">
              {fileNames.length > 0 && (
                <div className="flex w-full overflow-x-auto">
                  {fileNames.map((name, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFileIndex(index)}
                      className={cn(
                        "relative px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2",
                        selectedFileIndex === index
                          ? "border-primary text-primary bg-primary/5"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      )}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="mx-auto max-w-4xl space-y-6">
              {isAnalyzing ? (
                /* Loading State */
                <div className="flex h-full flex-col items-center justify-center space-y-6">
                  <div className="relative h-32 w-32">
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">
                        {progress}%
                      </span>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      正在深度解析专利文档...
                    </h3>
                    <p className="text-muted-foreground">
                      正在分析：{fileNames[selectedFileIndex]}
                    </p>
                  </div>
                </div>
              ) : (
                /* Analysis Results - Technical Cards */
                <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                    {analysisSections.map((section, index) => (
                      <div
                        key={index}
                        className={cn(
                          index !== 0 && "mt-8 border-t border-border pt-8",
                        )}
                      >
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                            {section.icon}
                          </div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {section.title}
                          </h3>
                        </div>

                        <div className="pl-[52px]">
                          <p className="mb-4 text-sm text-foreground/80 leading-relaxed">
                            {section.content}
                          </p>

                          {section.items && (
                            <ul className="space-y-2">
                              {section.items.map((item, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Patent Analysis Summary - Only show if multiple files */}
                  {!isAnalyzing && fileNames.length > 1 && (
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                          <Lightbulb className="h-5 w-5 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          专利解析总结
                        </h3>
                      </div>

                      <div className="pl-[52px]">
                        <p className="mb-4 text-sm text-foreground/80 leading-relaxed">
                          综合分析上述{fileNames.length}
                          份专利文档，可以看出该技术领域主要集中在解决复杂环境下的图像识别精度与效率问题。各专利方案在技术手段上各有侧重，但均采用了深度学习与传统图像处理相结合的思路。
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                            <span>
                              共性技术：均引入了注意力机制来增强特征提取能力。
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                            <span>
                              演进趋势：从单纯的算法优化向软硬件协同设计方向发展。
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
