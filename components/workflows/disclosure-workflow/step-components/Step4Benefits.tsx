"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
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
    <div className="flex flex-col gap-6">
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
                <Sparkles data-icon="inline-start" />
                AI生成
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={generateBeneficialEffects}
                disabled={isGeneratingBeneficialEffects}
                className="gap-2 bg-transparent"
              >
                {isGeneratingBeneficialEffects ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <RefreshCw data-icon="inline-start" />
                )}
                重新生成
              </Button>
            )}
          </div>
        </div>

        <Field className="relative">
          <FieldLabel htmlFor="beneficial-effects">有益效果</FieldLabel>
          <FieldDescription>
            基于技术背景和技术方案，AI将为您生成有益效果
          </FieldDescription>
          <Textarea
            id="beneficial-effects"
            value={beneficialEffects}
            onChange={(e) => setBeneficialEffects(e.target.value)}
            placeholder="点击'AI生成'按钮开始生成有益效果"
            rows={8}
            className="resize-none"
            readOnly={isGeneratingBeneficialEffects}
          />
          {isGeneratingBeneficialEffects && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md border shadow-sm">
              <Spinner className="size-3" />
              正在生成有益效果...
            </div>
          )}
        </Field>
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
                <Sparkles data-icon="inline-start" />
                AI生成
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={generateProtectionPoints}
                disabled={isGeneratingProtectionPoints}
                className="gap-2 bg-transparent"
              >
                {isGeneratingProtectionPoints ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <RefreshCw data-icon="inline-start" />
                )}
                重新生成
              </Button>
            )}
          </div>
        </div>
        <Field className="relative">
          <FieldLabel htmlFor="protection-points">
            技术关键点和欲保护点
          </FieldLabel>
          <FieldDescription>AI已基于技术方案自动识别关键点</FieldDescription>
          <Textarea
            id="protection-points"
            value={protectionPoints}
            onChange={(e) => setProtectionPoints(e.target.value)}
            placeholder="点击'AI生成'按钮开始生成欲保护点"
            rows={8}
            className="resize-none"
            readOnly={isGeneratingProtectionPoints}
          />
          {isGeneratingProtectionPoints && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md border shadow-sm">
              <Spinner className="size-3" />
              正在生成欲保护点...
            </div>
          )}
        </Field>
      </div>
    </div>
  );
}
