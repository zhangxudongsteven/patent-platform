"use client";

import React from "react";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Send,
  FileSearch,
  FileText,
  FileBarChart,
  FileScan,
  Upload,
  X,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Tool {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

const tools: Tool[] = [
  {
    id: "patent-search",
    name: "专利检索",
    icon: Search,
    description: "全库专利检索",
  },
  {
    id: "disclosure",
    name: "专利交底书",
    icon: FileText,
    description: "撰写技术交底书",
  },
  {
    id: "search-formula",
    name: "专利检索式",
    icon: FileSearch,
    description: "生成专业检索式",
  },
  {
    id: "report",
    name: "专利检索报告",
    icon: FileBarChart,
    description: "生成检索报告",
  },
  {
    id: "analysis",
    name: "专利解析",
    icon: FileScan,
    description: "深度解析专利",
  },
];

interface ChatInputProps {
  onSend?: (message: string, tool?: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 判断是否需要文件上传
  const needsFileUpload =
    selectedTool === "search-formula" ||
    selectedTool === "report" ||
    selectedTool === "analysis";

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (needsFileUpload) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!needsFileUpload) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // 根据工具类型过滤文件
    const validExtensions =
      selectedTool === "analysis"
        ? [".doc", ".docx", ".pdf"]
        : [".doc", ".docx"];

    const validFiles = files.filter((file) => {
      const lowerName = file.name.toLowerCase();
      return validExtensions.some((ext) => lowerName.endsWith(ext));
    });

    if (validFiles.length > 0) {
      if (selectedTool === "analysis") {
        setUploadedFiles((prev) => [...prev, ...validFiles]);
      } else {
        setUploadedFiles([validFiles[0]]);
      }
    }
  };

  const handleSend = () => {
    // 专利交底书直接进入工作流
    if (selectedTool === "disclosure") {
      onSend?.("开始专利交底书流程", selectedTool);
      setSelectedTool(null);
      return;
    }

    if (needsFileUpload && uploadedFiles.length > 0) {
      const fileNames = uploadedFiles.map((f) => f.name).join("、");
      onSend?.(`已上传文件：${fileNames}`, selectedTool || undefined);
      setUploadedFiles([]);
    } else if (!needsFileUpload && message.trim()) {
      onSend?.(message, selectedTool || undefined);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      if (selectedTool === "analysis") {
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
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToolChange = (value: string) => {
    if (!value) {
      setSelectedTool(null);
      setUploadedFiles([]);
      return;
    }

    if (value === "disclosure") {
      onSend?.("开始专利交底书流程", "disclosure");
      setSelectedTool(null);
      setUploadedFiles([]);
      return;
    }

    setSelectedTool(value);
    setUploadedFiles([]);
  };

  const getUploadText = () => {
    if (selectedTool === "analysis")
      return "点击或拖拽上传专利文件（支持多选）";
    if (selectedTool === "search-formula") return "点击或拖拽上传技术交底书";
    if (selectedTool === "report") return "点击或拖拽上传技术交底书";
    return "点击或拖拽上传文件";
  };

  const getAcceptTypes = () => {
    if (selectedTool === "analysis") return ".doc,.docx,.pdf";
    return ".doc,.docx";
  };

  const getFormatText = () => {
    if (selectedTool === "analysis") return "支持 DOC、DOCX、PDF 格式";
    return "支持 DOC、DOCX 格式";
  };

  const getPlaceholderText = () => {
    if (selectedTool === "patent-search") {
      return "请输入关键词进行检索...";
    }
    return "向专利助手提问...";
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      {/* Main Input Box */}
      <div className="rounded-2xl border border-border bg-card shadow-lg">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptTypes()}
          onChange={handleFileChange}
          className="hidden"
          multiple={selectedTool === "analysis"}
        />

        {/* Text Input Area or File Upload Area */}
        {needsFileUpload ? (
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
                    className="flex items-center justify-between rounded-lg border border-border bg-accent/50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
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
                      className="size-8 text-muted-foreground hover:text-foreground"
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
                className={cn(
                  "h-auto w-full justify-center gap-3 border-dashed px-4 py-8 text-left",
                  isDragging && "border-primary bg-primary/10",
                )}
              >
                <Upload className="size-6 text-muted-foreground" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">
                    {getUploadText()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getFormatText()}
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
              placeholder={getPlaceholderText()}
              className="max-h-[200px] min-h-[60px] resize-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
              rows={2}
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
          >
            {tools.map((tool) => {
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
                needsFileUpload ? uploadedFiles.length === 0 : !message.trim()
              }
              size="icon"
              className="rounded-full"
            >
              <Send data-icon="icon" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
