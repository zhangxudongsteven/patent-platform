"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useDisclosureContext } from "../context";

export function Step4Benefits() {
  const {
    beneficialEffects,
    setBeneficialEffects,
    protectionPoints,
    setProtectionPoints,
    isGeneratingBeneficialEffects,
    isGeneratingProtectionPoints,
    generateBeneficialEffects,
    generateProtectionPoints,
  } = useDisclosureContext();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            本发明技术方案带来的有益效果
          </h2>
          <div className="flex gap-2">
            {!beneficialEffects ? (
              <Button
                variant="outline"
                onClick={generateBeneficialEffects}
                disabled={isGeneratingBeneficialEffects}
                className="gap-2 bg-transparent"
              >
                <Sparkles className="h-4 w-4" />
                AI生成
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={generateBeneficialEffects}
                disabled={isGeneratingBeneficialEffects}
                className="gap-2 bg-transparent"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    isGeneratingBeneficialEffects && "animate-spin",
                  )}
                />
                重新生成
              </Button>
            )}
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          基于技术背景和技术方案，AI将为您生成有益效果
        </p>

        <div className="relative">
          <Textarea
            value={beneficialEffects}
            onChange={(e) => setBeneficialEffects(e.target.value)}
            placeholder="点击'AI生成'按钮开始生成有益效果"
            rows={8}
            className="resize-none"
            readOnly={isGeneratingBeneficialEffects}
          />
          {isGeneratingBeneficialEffects && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md border shadow-sm">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              正在生成有益效果...
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            本发明的技术关键点和欲保护点
          </h2>
          <div className="flex gap-2">
            {!protectionPoints ? (
              <Button
                variant="outline"
                onClick={generateProtectionPoints}
                disabled={isGeneratingProtectionPoints}
                className="gap-2 bg-transparent"
              >
                <Sparkles className="h-4 w-4" />
                AI生成
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={generateProtectionPoints}
                disabled={isGeneratingProtectionPoints}
                className="gap-2 bg-transparent"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    isGeneratingProtectionPoints && "animate-spin",
                  )}
                />
                重新生成
              </Button>
            )}
          </div>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          AI已基于技术方案自动识别关键点
        </p>
        <div className="relative">
          <Textarea
            value={protectionPoints}
            onChange={(e) => setProtectionPoints(e.target.value)}
            placeholder="点击'AI生成'按钮开始生成欲保护点"
            rows={8}
            className="resize-none"
            readOnly={isGeneratingProtectionPoints}
          />
          {isGeneratingProtectionPoints && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md border shadow-sm">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              正在生成欲保护点...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
