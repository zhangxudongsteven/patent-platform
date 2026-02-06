"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useDisclosureContext } from "../context";

export function Step2TechBackground() {
  const {
    inventionName,
    technicalField,
    techBackground,
    setTechBackground,
    isGeneratingBackground,
    existingProblems,
    setExistingProblems,
    generateTechBackground,
  } = useDisclosureContext();

  // 当现有问题更新时，同步更新技术背景（如果技术背景为空或看起来像是由问题生成的）
  // 但这里我们想要的是：用户输入问题 -> 点击生成 -> AI生成内容填充到同一个框
  // 或者用户直接在框里写背景。
  // 用户的需求是：合并两个输入框。直接在现有技术问题这个文本框中写入。
  // 这意味着我们只需要保留 `techBackground` 这个状态对应的输入框，
  // 并且可能需要调整 `generateTechBackground` 的逻辑，让它基于当前框里的内容（作为问题输入）或者其他输入来生成。

  // 实际上，通常逻辑是：用户输入“现有技术问题”，然后AI基于此生成“技术背景”。
  // 如果合并，用户可能直接在唯一的框里输入问题，然后点击生成，生成的内容覆盖或追加到这个框里。
  // 或者用户直接在框里写完整的背景。

  // 根据指示：“直接在现有技术问题这个文本框中写入。”
  // 我们可以把 `techBackground` 作为唯一的输入框。
  // 之前的 `existingProblems` 可能就不再需要单独的 UI 输入了，或者它就是 `techBackground` 的初始内容。
  // 但是 `generateTechBackground` 依然需要知道“问题”是什么。
  // 如果用户在框里写了问题，点击生成，我们应该把框里的内容当作 `existingProblems` 发给 AI，
  // 然后把 AI 返回的 `techBackground` 填回这个框（覆盖或追加）。

  return (
    <div className="space-y-6">
      {/* 步骤1：输入现有技术问题 */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          1. 描述现有技术问题
        </h2>

        <div className="bg-muted/50 p-4 rounded-md mb-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2 flex items-center gap-2">
            <span className="text-primary">💡</span> 填写指引
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>请详细描述当前技术方案中存在的具体问题、缺陷或不足。</li>
            <li>例如：效率低下、成本过高、操作复杂、精度不足等。</li>
            <li>AI 将根据您描述的问题，自动撰写专业的技术背景部分。</li>
          </ul>
        </div>

        <Textarea
          value={existingProblems}
          onChange={(e) => setExistingProblems(e.target.value)}
          placeholder="请输入现有技术存在的问题..."
          rows={6}
          className="resize-none mb-4"
        />

        <div className="flex justify-end">
          <Button
            onClick={() => generateTechBackground("ai")}
            disabled={isGeneratingBackground || !existingProblems.trim()}
            className="gap-2"
          >
            {isGeneratingBackground ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGeneratingBackground ? "生成中..." : "AI 生成技术背景"}
          </Button>
        </div>
      </div>

      {/* 步骤2：生成的/编辑的技术背景 */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            2. 技术背景 (AI 生成)
          </h2>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          基于发明名称"{inventionName}"、技术领域"{technicalField}
          "以及您描述的现有问题，AI为您生成的专业技术背景。您可以直接在下方编辑。
        </p>

        <div className="relative">
          <Textarea
            value={techBackground}
            onChange={(e) => setTechBackground(e.target.value)}
            placeholder="AI 生成的内容将显示在这里..."
            rows={15}
            className="resize-none"
            readOnly={isGeneratingBackground}
          />
          {isGeneratingBackground && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md border shadow-sm">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              AI正在生成...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
