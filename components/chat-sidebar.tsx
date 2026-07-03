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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
    icon: <MessageSquare />,
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
    icon: <Search />,
    isOpen: false,
    chats: [
      { id: "sf1", title: "新能源电池检索式", date: "今天" },
      { id: "sf2", title: "人工智能算法检索", date: "2天前" },
    ],
  },
  {
    id: "disclosure",
    name: "专利交底书",
    icon: <FileText />,
    isOpen: false,
    chats: [
      { id: "d1", title: "智能温控系统交底书", date: "昨天" },
      { id: "d2", title: "数据加密方法交底书", date: "1周前" },
    ],
  },
  {
    id: "report",
    name: "专利检索报告",
    icon: <FileText />,
    isOpen: false,
    chats: [{ id: "r1", title: "无线充电技术检索报告", date: "3天前" }],
  },
  {
    id: "patent-search",
    name: "专利检索",
    icon: <Search />,
    isOpen: false,
    chats: [{ id: "ps1", title: "量子计算专利检索", date: "今天" }],
  },
  {
    id: "analysis",
    name: "专利解析",
    icon: <FileText />,
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

  const showNotImplemented = () => {
    toast.info("功能未实现");
  };

  if (isCollapsed) {
    return (
      <div className="flex h-full w-14 flex-col border-r border-border bg-sidebar">
        <div className="flex h-14 items-center justify-center border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="size-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <PanelLeftClose data-icon="icon" className="rotate-180" />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-2 p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Plus data-icon="icon" />
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
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="text-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-foreground">
            专利助手
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="size-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <PanelLeftClose data-icon="icon" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onNewChat}
        >
          <Plus data-icon="inline-start" />
          新建对话
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <InputGroup className="border-border bg-sidebar-accent/50">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="搜索对话..."
            className="text-sidebar-foreground placeholder:text-muted-foreground"
          />
        </InputGroup>
      </div>

      {/* Folders and Chats */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {folders.map((folder) => (
            <div key={folder.id}>
              {/* Folder Header */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => toggleFolder(folder.id)}
                className="h-auto w-full justify-start gap-2 px-2 py-2 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {folder.isOpen ? (
                  <ChevronDown data-icon="inline-start" />
                ) : (
                  <ChevronRight data-icon="inline-start" />
                )}
                {folder.isOpen ? (
                  <FolderOpen className="text-primary" />
                ) : (
                  <FolderClosed className="text-primary" />
                )}
                <span className="flex-1 text-left font-medium">
                  {folder.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {folder.chats.length}
                </span>
              </Button>

              {/* Chat Items */}
              {folder.isOpen && (
                <div className="ml-4 space-y-0.5 border-l border-border pl-3">
                  {folder.chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "group flex w-full items-center gap-1 rounded-lg pr-1 text-sm transition-colors",
                        activeChat === chat.id
                          ? "bg-sidebar-accent text-sidebar-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      )}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setActiveChat(chat.id)}
                        className="h-auto min-w-0 flex-1 justify-start gap-2 px-2 py-1.5 text-inherit hover:bg-transparent hover:text-inherit"
                        aria-current={
                          activeChat === chat.id ? "page" : undefined
                        }
                      >
                        <MessageSquare data-icon="inline-start" />
                        <span className="truncate text-left">{chat.title}</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 opacity-0 hover:bg-background/20 group-hover:opacity-100 focus-visible:opacity-100"
                            aria-label={`${chat.title} 更多操作`}
                          >
                            <MoreHorizontal data-icon="icon" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onSelect={showNotImplemented}>
                              重命名
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={showNotImplemented}>
                              移动到文件夹
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={showNotImplemented}
                            >
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-sm font-medium">用</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              我的空间
            </p>
          </div>
          <FolderOpen className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
