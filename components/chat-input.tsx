"use client";

import React from "react";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Send, FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  chatTools,
  formatUploadedFileMessage,
  getToolConfig,
  getPlaceholderText,
  getUploadConfig,
  getValidFiles,
  needsFileUpload,
  toUploadedFileMeta,
} from "@/components/chat/tool-config";
import type { ChatSubmit, ChatToolId } from "@/components/chat/types";
import { toast } from "sonner";

interface ChatInputProps {
  onSubmit?: (payload: ChatSubmit) => boolean | Promise<boolean | void> | void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedTool, setSelectedTool] = useState<ChatToolId | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadConfig = getUploadConfig(selectedTool);
  const requiresFileUpload = needsFileUpload(selectedTool);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (requiresFileUpload) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const showInvalidFileToast = (files: File[], validFiles: File[]) => {
    const invalidFiles = files.filter((file) => !validFiles.includes(file));

    if (invalidFiles.length === 0) {
      return;
    }

    const toolName = getToolConfig(selectedTool)?.name ?? "当前工具";
    const formatText = uploadConfig?.formatText ?? "请上传支持的文件格式";
    toast.error(
      `${toolName}不支持：${invalidFiles.map((file) => file.name).join("、")}`,
      {
        description: formatText,
      },
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || !requiresFileUpload) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const validFiles = getValidFiles(files, selectedTool);
    showInvalidFileToast(files, validFiles);

    if (validFiles.length > 0) {
      if (uploadConfig?.multiple) {
        setUploadedFiles((prev) => [...prev, ...validFiles]);
      } else {
        setUploadedFiles([validFiles[0]]);
      }
    }
  };

  const handleSend = async () => {
    if (disabled) return;

    // 专利交底书直接进入工作流
    if (selectedTool === "disclosure") {
      const accepted = await onSubmit?.({
        type: "workflow",
        toolId: selectedTool,
        message: "开始专利交底书流程",
      });
      if (accepted !== false) {
        setSelectedTool(null);
      }
      return;
    }

    if (requiresFileUpload && selectedTool && uploadedFiles.length > 0) {
      const files = uploadedFiles.map(toUploadedFileMeta);
      const accepted = await onSubmit?.({
        type: "workflow",
        toolId: selectedTool,
        files,
        message: formatUploadedFileMessage(files),
      });
      if (accepted !== false) {
        setUploadedFiles([]);
      }
    } else if (!requiresFileUpload && message.trim()) {
      const trimmedMessage = message.trim();
      let accepted: boolean | void | undefined;

      if (selectedTool === "patent-search") {
        accepted = await onSubmit?.({
          type: "workflow",
          toolId: selectedTool,
          message: trimmedMessage,
        });
      } else {
        accepted = await onSubmit?.({
          type: "chat",
          message: trimmedMessage,
          toolId: selectedTool || undefined,
        });
      }

      if (accepted !== false) {
        setMessage("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const files = getValidFiles(selectedFiles, selectedTool);
    showInvalidFileToast(selectedFiles, files);

    if (files.length > 0) {
      if (uploadConfig?.multiple) {
        setUploadedFiles((prev) => [...prev, ...files]);
      } else {
        setUploadedFiles([files[0]]);
      }
    }
    // 重置 input value 以允许重复上传同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    if (disabled) return;
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToolChange = async (value: string) => {
    if (disabled) return;

    if (!value) {
      setSelectedTool(null);
      setUploadedFiles([]);
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
        setUploadedFiles([]);
      }
      return;
    }

    setSelectedTool(value as ChatToolId);
    setUploadedFiles([]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      {/* Main Input Box */}
      <div className="rounded-2xl border border-border bg-card shadow-lg">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={uploadConfig?.accept}
          onChange={handleFileChange}
          className="hidden"
          multiple={uploadConfig?.multiple}
          disabled={disabled}
          aria-label="上传文件"
        />

        {/* Text Input Area or File Upload Area */}
        {requiresFileUpload ? (
          <div
            className={cn(
              "p-4 transition-colors",
              isDragging && "bg-primary/5",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadedFiles.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-accent/50 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="size-5 text-primary" />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(index)}
                      disabled={disabled}
                      className="size-8 text-muted-foreground hover:text-foreground"
                      aria-label={`移除文件 ${file.name}`}
                    >
                      <X data-icon="icon" />
                    </Button>
                  </div>
                ))}
                {selectedTool === "analysis" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadClick}
                    disabled={disabled}
                    className="h-auto w-full border-dashed py-2 text-muted-foreground"
                  >
                    <Upload data-icon="inline-start" />
                    继续上传（或拖拽文件）
                  </Button>
                )}
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleUploadClick}
                disabled={disabled}
                className={cn(
                  "h-auto w-full justify-center gap-3 border-dashed px-4 py-8 text-left",
                  isDragging && "border-primary bg-primary/10",
                )}
              >
                <Upload data-icon="inline-start" />
                <div className="flex min-w-0 flex-col items-start">
                  <span className="text-sm font-medium text-foreground">
                    {uploadConfig?.prompt || "点击或拖拽上传文件"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {uploadConfig?.formatText || "支持 DOC、DOCX 格式"}
                  </span>
                </div>
              </Button>
            )}
          </div>
        ) : (
          <div className="p-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholderText(selectedTool)}
              name="chat-message"
              className="max-h-[200px] min-h-[60px] resize-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
              rows={2}
              disabled={disabled}
            />
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          {/* Left Side - Tool Options */}
          <ToggleGroup
            type="single"
            value={selectedTool ?? ""}
            onValueChange={handleToolChange}
            className="flex-wrap justify-start"
            disabled={disabled}
          >
            {chatTools.map((tool) => {
              const ToolIcon = tool.icon;

              return (
                <ToggleGroupItem
                  key={tool.id}
                  value={tool.id}
                  aria-label={tool.description}
                  size="sm"
                  className="gap-1.5"
                >
                  <ToolIcon />
                  <span>{tool.name}</span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSend}
              disabled={
                disabled ||
                (requiresFileUpload
                  ? uploadedFiles.length === 0
                  : !message.trim())
              }
              size="icon"
              className="rounded-full"
              aria-label="发送"
            >
              <Send data-icon="icon" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
