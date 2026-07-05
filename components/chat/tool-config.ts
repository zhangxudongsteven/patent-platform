"use client";

import {
  FileBarChart,
  FileScan,
  FileSearch,
  FileText,
  Search,
  type LucideIcon,
} from "lucide-react";

import type { ChatToolId, UploadedFileMeta } from "@/components/chat/types";

export interface ChatTool {
  id: ChatToolId;
  name: string;
  icon: LucideIcon;
  description: string;
  upload?: {
    multiple: boolean;
    accept: string;
    extensions: string[];
    prompt: string;
    formatText: string;
  };
}

export const chatTools: ChatTool[] = [
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
    upload: {
      multiple: false,
      accept: ".doc,.docx",
      extensions: [".doc", ".docx"],
      prompt: "点击或拖拽上传技术交底书",
      formatText: "支持 DOC、DOCX 格式",
    },
  },
  {
    id: "report",
    name: "专利检索报告",
    icon: FileBarChart,
    description: "生成检索报告",
    upload: {
      multiple: false,
      accept: ".doc,.docx",
      extensions: [".doc", ".docx"],
      prompt: "点击或拖拽上传技术交底书",
      formatText: "支持 DOC、DOCX 格式",
    },
  },
  {
    id: "analysis",
    name: "专利解析",
    icon: FileScan,
    description: "深度解析专利",
    upload: {
      multiple: true,
      accept: ".doc,.docx,.pdf",
      extensions: [".doc", ".docx", ".pdf"],
      prompt: "点击或拖拽上传专利文件（支持多选）",
      formatText: "支持 DOC、DOCX、PDF 格式",
    },
  },
];

export function getToolConfig(toolId: ChatToolId | null | undefined) {
  return chatTools.find((tool) => tool.id === toolId);
}

export function getUploadConfig(toolId: ChatToolId | null | undefined) {
  return getToolConfig(toolId)?.upload;
}

export function needsFileUpload(toolId: ChatToolId | null | undefined) {
  return Boolean(getUploadConfig(toolId));
}

export function getPlaceholderText(toolId: ChatToolId | null | undefined) {
  if (toolId === "patent-search") {
    return "请输入关键词进行检索…";
  }

  return "向专利助手提问…";
}

export function formatUploadedFileMessage(files: UploadedFileMeta[]) {
  return `已上传文件：${files.map((file) => file.name).join("、")}`;
}
