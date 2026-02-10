"use client";

import React from "react";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  FileText,
  FolderOpen,
  FolderClosed,
  Plus,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  PanelLeftClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatItem {
  id: string;
  title: string;
  date: string;
}

interface FolderData {
  id: string;
  name: string;
  icon: React.ReactNode;
  chats: ChatItem[];
  isOpen: boolean;
}

const initialFolders: FolderData[] = [
  {
    id: "general",
    name: "通用对话",
    icon: <MessageSquare className="h-4 w-4" />,
    isOpen: true,
    chats: [
      { id: "g1", title: "专利基础知识咨询", date: "今天" },
      { id: "g2", title: "专利申请流程", date: "昨天" },
      { id: "g3", title: "专利保护范围分析", date: "3天前" },
    ],
  },
  {
    id: "search-formula",
    name: "专利检索式",
    icon: <Search className="h-4 w-4" />,
    isOpen: false,
    chats: [
      { id: "sf1", title: "新能源电池检索式", date: "今天" },
      { id: "sf2", title: "人工智能算法检索", date: "2天前" },
    ],
  },
  {
    id: "disclosure",
    name: "专利交底书",
    icon: <FileText className="h-4 w-4" />,
    isOpen: false,
    chats: [
      { id: "d1", title: "智能温控系统交底书", date: "昨天" },
      { id: "d2", title: "数据加密方法交底书", date: "1周前" },
    ],
  },
  {
    id: "report",
    name: "专利检索报告",
    icon: <FileText className="h-4 w-4" />,
    isOpen: false,
    chats: [{ id: "r1", title: "无线充电技术检索报告", date: "3天前" }],
  },
  {
    id: "patent-search",
    name: "专利检索",
    icon: <Search className="h-4 w-4" />,
    isOpen: false,
    chats: [{ id: "ps1", title: "量子计算专利检索", date: "今天" }],
  },
  {
    id: "analysis",
    name: "专利解析",
    icon: <FileText className="h-4 w-4" />,
    isOpen: false,
    chats: [
      { id: "a1", title: "CN202310001234解析", date: "今天" },
      { id: "a2", title: "US20230001234解析", date: "昨天" },
    ],
  },
];

export function ChatSidebar({ onNewChat }: { onNewChat?: () => void }) {
  const [folders, setFolders] = useState<FolderData[]>(initialFolders);
  const [activeChat, setActiveChat] = useState<string>("g1");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleFolder = (folderId: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, isOpen: !folder.isOpen } : folder,
      ),
    );
  };

  if (isCollapsed) {
    return (
      <div className="flex h-full w-14 flex-col border-r border-border bg-sidebar">
        <div className="flex h-14 items-center justify-center border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <PanelLeftClose className="h-4 w-4 rotate-180" />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-2 p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent",
                folders.find((f) => f.chats.some((c) => c.id === activeChat))
                  ?.id === folder.id && "bg-sidebar-accent",
              )}
              onClick={() => {
                setIsCollapsed(false);
                toggleFolder(folder.id);
              }}
            >
              {folder.icon}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">
            专利助手
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          新建对话
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-sidebar-accent/50 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索对话..."
            className="flex-1 bg-transparent text-sm text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Folders and Chats */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {folders.map((folder) => (
            <div key={folder.id}>
              {/* Folder Header */}
              <button
                onClick={() => toggleFolder(folder.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {folder.isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                {folder.isOpen ? (
                  <FolderOpen className="h-4 w-4 text-primary" />
                ) : (
                  <FolderClosed className="h-4 w-4 text-primary" />
                )}
                <span className="flex-1 text-left font-medium">
                  {folder.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {folder.chats.length}
                </span>
              </button>

              {/* Chat Items */}
              {folder.isOpen && (
                <div className="ml-4 space-y-0.5 border-l border-border pl-3">
                  {folder.chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors cursor-pointer",
                        activeChat === chat.id
                          ? "bg-sidebar-accent text-sidebar-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1 truncate text-left">
                        {chat.title}
                      </span>
                      <div
                        className="opacity-0 group-hover:opacity-100 hover:bg-background/20 rounded p-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement menu actions
                        }}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-sm font-medium">用</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              我的空间
            </p>
          </div>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
