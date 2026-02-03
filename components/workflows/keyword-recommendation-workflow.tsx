"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Search,
  Tags,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface KeywordRecommendationWorkflowProps {
  onBack: () => void;
}

interface KeywordSuggestion {
  term: string;
  score: number;
}

export function KeywordRecommendationWorkflow({ onBack }: KeywordRecommendationWorkflowProps) {
  const [coreKeyword, setCoreKeyword] = useState("");
  const [technicalField, setTechnicalField] = useState("");
  const [desiredCount, setDesiredCount] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateRecommendations = async () => {
    if (!coreKeyword.trim()) {
      setError("请输入核心关键词");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/disclosure/keyword-recommendation?keyword=${encodeURIComponent(coreKeyword)}&field=${encodeURIComponent(technicalField)}&count=${desiredCount}`
      );

      if (!response.ok) {
        throw new Error("API 调用失败");
      }

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.data.recommendations);
      } else {
        setError(data.error || "生成关键词推荐失败");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
      // 失败时使用默认关键词
      setRecommendations(["智能座舱", "车载系统", "汽车电子", "人机交互", "驾驶辅助"]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              专利关键词-LLM关联词推荐
            </h1>
            <p className="text-sm text-muted-foreground">
              基于LLM技术的专利关键词智能推荐
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Input Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tags className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                关键词推荐设置
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  核心关键词 *
                </label>
                <Input
                  type="text"
                  value={coreKeyword}
                  onChange={(e) => setCoreKeyword(e.target.value)}
                  placeholder="例如：智能座舱"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  技术领域
                </label>
                <Input
                  type="text"
                  value={technicalField}
                  onChange={(e) => setTechnicalField(e.target.value)}
                  placeholder="例如：汽车电子"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  期望推荐数量
                </label>
                <Input
                  type="number"
                  value={desiredCount}
                  onChange={(e) => setDesiredCount(e.target.value)}
                  min="1"
                  max="20"
                  className="w-full"
                />
              </div>

              <Button
                onClick={generateRecommendations}
                disabled={isGenerating || !coreKeyword.trim()}
                className="w-full flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    生成关联词推荐
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="border-destructive bg-destructive/10 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-destructive">{error}</p>
              </div>
            </Card>
          )}

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  推荐关联词
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-accent/30 rounded-lg px-3 py-2"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-foreground">{keyword}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-2">
                  推荐结果（可直接复制使用）
                </h3>
                <Textarea
                  value={recommendations.join("、")}
                  readOnly
                  className="w-full bg-muted/50"
                  rows={3}
                />
              </div>
            </Card>
          )}

          {/* Usage Tips */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                使用提示
              </h2>
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  输入核心关键词后，系统会基于LLM技术生成相关的扩展关联词
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  选择合适的技术领域可以提高推荐结果的相关性
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  推荐的关联词可用于专利检索、技术分析或专利申请文件撰写
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  系统会自动处理同义词、上下位概念、技术流程关联词及应用场景词
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
