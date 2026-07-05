"use client";

import type { ChatStatus, FileUIPart } from "ai";
import { FileText, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  chatTools,
  formatUploadedFileMessage,
  getPlaceholderText,
  getToolConfig,
  getUploadConfig,
  needsFileUpload,
} from "@/components/chat/tool-config";
import type {
  ChatSubmit,
  ChatToolId,
  UploadedFileMeta,
} from "@/components/chat/types";

interface ChatInputProps {
  onSubmit?: (payload: ChatSubmit) => boolean | Promise<boolean | void> | void;
  disabled?: boolean;
  status?: ChatStatus;
  showTools?: boolean;
  placeholder?: string;
  className?: string;
}

function toUploadedFileMeta(file: FileUIPart): UploadedFileMeta {
  return {
    name: file.filename || "未命名文件",
    size: 0,
    type: file.mediaType || "",
  };
}

function getValidFileMetas(
  files: FileUIPart[],
  selectedTool: ChatToolId | null,
) {
  const uploadConfig = getUploadConfig(selectedTool);

  if (!uploadConfig) {
    return [];
  }

  const validFiles = files.map(toUploadedFileMeta).filter((file) => {
    const lowerName = file.name.toLowerCase();
    return uploadConfig.extensions.some((ext) => lowerName.endsWith(ext));
  });

  return uploadConfig.multiple ? validFiles : validFiles.slice(0, 1);
}

function UploadedFilesPreview({ disabled }: { disabled: boolean }) {
  const attachments = usePromptInputAttachments();

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
      {attachments.files.map((file) => (
        <div
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-accent/50 px-4 py-3"
          key={file.id}
        >
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="size-5 text-primary" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {file.filename || "未命名文件"}
              </span>
              {file.mediaType && (
                <span className="truncate text-xs text-muted-foreground">
                  {file.mediaType}
                </span>
              )}
            </div>
          </div>
          <Button
            aria-label={`移除文件 ${file.filename || "未命名文件"}`}
            className="size-8 text-muted-foreground hover:text-foreground"
            disabled={disabled}
            onClick={() => attachments.remove(file.id)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X data-icon="icon" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function UploadButton({
  disabled,
  selectedTool,
}: {
  disabled: boolean;
  selectedTool: ChatToolId | null;
}) {
  const attachments = usePromptInputAttachments();
  const uploadConfig = getUploadConfig(selectedTool);

  if (!needsFileUpload(selectedTool)) {
    return null;
  }

  return (
    <PromptInputButton
      className="h-auto w-full justify-center gap-3 border-dashed px-4 py-4 text-left"
      disabled={disabled}
      onClick={() => attachments.openFileDialog()}
      tooltip={uploadConfig?.formatText}
      variant="outline"
    >
      <Upload data-icon="inline-start" />
      <div className="flex min-w-0 flex-col items-start">
        <span className="text-sm font-medium text-foreground">
          {uploadConfig?.prompt || "点击或拖拽上传文件"}
        </span>
        <span className="text-xs text-muted-foreground">
          {uploadConfig?.formatText || "请选择支持的文件格式"}
        </span>
      </div>
    </PromptInputButton>
  );
}

function ChatSubmitButton({
  disabled,
  requiresFileUpload,
  status,
}: {
  disabled: boolean;
  requiresFileUpload: boolean;
  status: ChatStatus;
}) {
  const attachments = usePromptInputAttachments();

  return (
    <PromptInputSubmit
      disabled={
        disabled || (requiresFileUpload && attachments.files.length === 0)
      }
      status={status}
    />
  );
}

export function ChatInput({
  onSubmit,
  disabled = false,
  status = "ready",
  showTools = true,
  placeholder,
  className,
}: ChatInputProps) {
  const [selectedTool, setSelectedTool] = useState<ChatToolId | null>(null);
  const uploadConfig = getUploadConfig(selectedTool);
  const requiresFileUpload = needsFileUpload(selectedTool);

  const handleToolChange = async (value: string) => {
    if (disabled) {
      return;
    }

    if (!value) {
      setSelectedTool(null);
      return;
    }

    if (value === "disclosure") {
      const accepted = await onSubmit?.({
        type: "workflow",
        toolId: "disclosure",
        message: "开始专利交底书流程",
      });
      if (accepted !== false) {
        setSelectedTool(null);
      }
      return;
    }

    setSelectedTool(value as ChatToolId);
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    if (disabled) {
      throw new Error("Chat input is disabled.");
    }

    const text = message.text.trim();

    if (requiresFileUpload && selectedTool) {
      const files = getValidFileMetas(message.files, selectedTool);

      if (files.length === 0) {
        const toolName = getToolConfig(selectedTool)?.name ?? "当前工具";
        const formatText = uploadConfig?.formatText ?? "请上传支持的文件格式";
        toast.error(`${toolName}需要上传文件`, {
          description: formatText,
        });
        throw new Error("No valid files selected.");
      }

      const accepted = await onSubmit?.({
        type: "workflow",
        toolId: selectedTool,
        files,
        message: formatUploadedFileMessage(files),
      });
      if (accepted === false) {
        throw new Error("Workflow submission was rejected.");
      }
      return;
    }

    if (showTools && selectedTool === "patent-search") {
      if (!text) {
        throw new Error("Patent search query is empty.");
      }
      const accepted = await onSubmit?.({
        type: "workflow",
        toolId: "patent-search",
        message: text,
      });
      if (accepted === false) {
        throw new Error("Workflow submission was rejected.");
      }
      return;
    }

    if (!text) {
      throw new Error("Chat message is empty.");
    }

    const accepted = await onSubmit?.({
      type: "chat",
      message: text,
      toolId: selectedTool || undefined,
    });
    if (accepted === false) {
      throw new Error("Chat submission was rejected.");
    }
  };

  return (
    <div className={cn("mx-auto w-full max-w-3xl px-4 pb-6", className)}>
      <PromptInput
        accept={uploadConfig?.accept}
        className="rounded-2xl border border-border bg-card shadow-lg"
        maxFiles={uploadConfig?.multiple ? undefined : 1}
        multiple={uploadConfig?.multiple}
        onError={(error) => {
          const formatText = uploadConfig?.formatText ?? "请上传支持的文件格式";
          toast.error(error.message, {
            description: formatText,
          });
        }}
        onSubmit={handleSubmit}
      >
        {requiresFileUpload && (
          <PromptInputHeader className="flex-col items-stretch">
            <UploadedFilesPreview disabled={disabled} />
            <UploadButton disabled={disabled} selectedTool={selectedTool} />
          </PromptInputHeader>
        )}
        <PromptInputBody>
          {!requiresFileUpload && (
            <PromptInputTextarea
              disabled={disabled}
              placeholder={placeholder || getPlaceholderText(selectedTool)}
            />
          )}
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools className="flex-wrap">
            {showTools && (
              <ToggleGroup
                className="flex-wrap justify-start"
                disabled={disabled}
                onValueChange={handleToolChange}
                type="single"
                value={selectedTool ?? ""}
              >
                {chatTools.map((tool) => {
                  const ToolIcon = tool.icon;

                  return (
                    <ToggleGroupItem
                      aria-label={tool.description}
                      className="gap-1.5"
                      key={tool.id}
                      size="sm"
                      value={tool.id}
                    >
                      <ToolIcon />
                      <span>{tool.name}</span>
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
            )}
          </PromptInputTools>
          <ChatSubmitButton
            disabled={disabled}
            requiresFileUpload={requiresFileUpload}
            status={status}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
