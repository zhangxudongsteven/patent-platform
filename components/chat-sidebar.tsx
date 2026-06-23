"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface ChatItem {
  id: string;
  chatId?: string;
  title: string;
  date: string;
  content?: string;
  result?: string;
  fullContent?: string;
  operationType?: string;
  workflowStep?: number;
}

interface FolderData {
  id: string;
  name: string;
  icon: React.ReactNode;
  chats: ChatItem[];
  isOpen: boolean;
}

const folderConfig = [
  {
    id: "general",
    name: "通用对话",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    id: "search-formula",
    name: "专利检索式",
    icon: <Search className="h-4 w-4" />,
  },
  {
    id: "disclosure",
    name: "专利交底书",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "report",
    name: "专利检索报告",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "analysis",
    name: "专利解析",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "patent-search",
    name: "专利检索",
    icon: <Search className="h-4 w-4" />,
  },

];

export function ChatSidebar({ onNewChat, onChatClick }: { onNewChat?: () => void; onChatClick?: (chat: ChatItem) => void }) {
  const router = useRouter();
  
  const [folders, setFolders] = useState<FolderData[]>(() => {
    return folderConfig.map((config) => ({
      ...config,
      chats: [],
      isOpen: config.id === "general",
    }));
  });
  
  const [activeChat, setActiveChat] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebar-folders-state");
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setFolders(prev => prev.map(config => ({
            ...config,
            isOpen: parsed[config.id] ?? config.id === "general",
          })));
        } catch (e) {
          console.error("Failed to parse saved folder state:", e);
        }
      }
      
      const savedHistories = localStorage.getItem("sidebar-histories-cache");
      if (savedHistories) {
        try {
          const parsed = JSON.parse(savedHistories);
          setFolders(prev => prev.map(config => {
            const savedFolder = parsed[config.id];
            return {
              ...config,
              chats: savedFolder?.chats || [],
            };
          }));
        } catch (e) {
          console.error("Failed to parse saved histories cache:", e);
        }
      }

      const savedActiveChat = localStorage.getItem("sidebar-active-chat");
      if (savedActiveChat) {
        setActiveChat(savedActiveChat);
      }

      const savedCollapsed = localStorage.getItem("sidebar-collapsed");
      if (savedCollapsed === "true") {
        setIsCollapsed(true);
      }
    }
  }, []);

  useEffect(() => {
    fetchHistories();
  }, []);

  useEffect(() => {
    const handleHistoryUpdated = () => {
      fetchHistories();
    };

    window.addEventListener('history-updated', handleHistoryUpdated);
    return () => {
      window.removeEventListener('history-updated', handleHistoryUpdated);
    };
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchHistories(searchTerm.trim());
      } else {
        fetchHistories();
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchTerm]);

  const fetchHistories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/history");
      const data = await response.json();

      if (data.success) {
        const histories = data.data;
        
        // Get saved folder states from localStorage to restore original state
        let savedFolderState: Record<string, boolean> = {};
        if (typeof window !== "undefined") {
          const savedState = localStorage.getItem("sidebar-folders-state");
          if (savedState) {
            try {
              savedFolderState = JSON.parse(savedState);
            } catch (e) {
              console.error("Failed to parse saved folder state:", e);
            }
          }
        }
        
        const newFolders = folderConfig.map((config) => {
          return {
            ...config,
            chats: histories
              .filter((h: any) => h.folder_id === config.id)
              .map((h: any) => {
                let content = h.operation_content;
                let result = h.operation_result;
                let fullContent = h.operation_content;

                try {
                  if (h.operation_content) {
                    const conversations = JSON.parse(h.operation_content);
                    if (Array.isArray(conversations) && conversations.length > 0) {
                      const lastUserMessage = conversations.filter((c: any) => c.role === "user").pop();
                      const lastAssistantMessage = conversations.filter((c: any) => c.role === "assistant").pop();
                      content = lastUserMessage?.content || "";
                      result = lastAssistantMessage?.content || "";
                    }
                  }
                } catch (e) {
                  console.error("Failed to parse operation_content:", e);
                  content = h.operation_content;
                  result = h.operation_result;
                }

                return {
                  id: h.id.toString(),
                  chatId: h.chat_id,
                  title: h.operation_title,
                  date: formatDate(h.created_at),
                  content: content,
                  result: result,
                  fullContent: fullContent,
                  operationType: h.operation_type,
                  workflowStep: h.workflow_step,
                };
              }),
            isOpen: savedFolderState[config.id] ?? config.id === "general",
          };
        });
        
        setFolders(newFolders);
        
        if (typeof window !== "undefined") {
          const cacheData: Record<string, { chats: any[] }> = {};
          newFolders.forEach(folder => {
            cacheData[folder.id] = { chats: folder.chats };
          });
          localStorage.setItem("sidebar-histories-cache", JSON.stringify(cacheData));
        }
      }
    } catch (error) {
      console.error("Failed to fetch histories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchHistories = async (term: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/history?search=${encodeURIComponent(term)}`);
      const data = await response.json();

      if (data.success) {
        const histories = data.data;
        
        const newFolders = folderConfig.map((config) => {
          const existingFolder = folders.find(f => f.id === config.id);
          return {
            ...config,
            chats: histories
              .filter((h: any) => h.folder_id === config.id)
              .map((h: any) => {
                let content = h.operation_content;
                let result = h.operation_result;
                let fullContent = h.operation_content;

                try {
                  if (h.operation_content) {
                    const conversations = JSON.parse(h.operation_content);
                    if (Array.isArray(conversations) && conversations.length > 0) {
                      const lastUserMessage = conversations.filter((c: any) => c.role === "user").pop();
                      const lastAssistantMessage = conversations.filter((c: any) => c.role === "assistant").pop();
                      content = lastUserMessage?.content || "";
                      result = lastAssistantMessage?.content || "";
                    }
                  }
                } catch (e) {
                  console.error("Failed to parse operation_content:", e);
                  content = h.operation_content;
                  result = h.operation_result;
                }

                return {
                  id: h.id.toString(),
                  chatId: h.chat_id,
                  title: h.operation_title,
                  date: formatDate(h.created_at),
                  content: content,
                  result: result,
                  fullContent: fullContent,
                  operationType: h.operation_type,
                  workflowStep: h.workflow_step,
                };
              }),
            isOpen: true,
          };
        });
        
        setFolders(newFolders);
      }
    } catch (error) {
      console.error("Failed to search histories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistory = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/history/${chatId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setFolders(prev => 
          prev.map(folder => ({
            ...folder,
            chats: folder.chats.filter(chat => chat.id !== chatId),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to delete history:", error);
    }
  };

  const toggleFolder = (folderId: string) => {
    setFolders((prev) => {
      const next = prev.map((folder) =>
        folder.id === folderId ? { ...folder, isOpen: !folder.isOpen } : folder,
      );

      // 以“最新的 next 状态”来持久化，避免 localStorage 被旧闭包覆盖
      if (typeof window !== "undefined") {
        const state: Record<string, boolean> = {};
        next.forEach((folder) => {
          state[folder.id] = folder.isOpen;
        });
        localStorage.setItem("sidebar-folders-state", JSON.stringify(state));
      }

      return next;
    });
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
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar overflow-hidden">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-3 shrink-0">
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
      <div className="p-3 shrink-0">
        <Button
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          新建对话
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2 shrink-0">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-sidebar-accent/50 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索对话..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Folders and Chats */}
      <div className="flex-1 px-2 overflow-y-auto custom-scrollbar">
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
                <div className="ml-4 space-y-0.5 border-l border-border pl-2">
                  {folder.chats.length === 0 ? (
                    <div className="px-2 py-2 text-xs text-muted-foreground">
                      {isLoading ? "加载中..." : "暂无记录"}
                    </div>
                  ) : (
                    folder.chats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setActiveChat(chat.id);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("sidebar-active-chat", chat.id);
                          }
                          setSearchTerm("");
                          
                          if (chat.operationType === "disclosure") {
                            if (chat.chatId) {
                              router.push(`/history/disclosure/${chat.chatId}`);
                            } else if (onChatClick) {
                              onChatClick(chat);
                            } else {
                              router.push("/");
                            }
                          } else if (chat.operationType === "search-formula") {
                            if (chat.chatId) {
                              router.push(`/history/search-formula/${chat.chatId}`);
                            } else if (onChatClick) {
                              onChatClick(chat);
                            } else {
                              router.push("/");
                            }
                          } else if (chat.operationType === "report") {
                            if (chat.chatId) {
                              router.push(`/history/report/${chat.chatId}`);
                            } else if (onChatClick) {
                              onChatClick(chat);
                            } else {
                              router.push("/");
                            }
                          } else if (chat.operationType === "patent-search") {
                            if (chat.chatId) {
                              router.push(`/history/patent-search/${chat.chatId}`);
                            } else if (onChatClick) {
                              onChatClick(chat);
                            } else {
                              router.push("/");
                            }
                          } else if (chat.operationType === "analysis") {
                            if (chat.chatId) {
                              router.push(`/history/analysis/${chat.chatId}`);
                            } else if (onChatClick) {
                              onChatClick(chat);
                            } else {
                              router.push("/");
                            }
                          } else if (chat.chatId) {
                            router.push(`/history/chat/${chat.chatId}`);
                          } else if (onChatClick) {
                            onChatClick(chat);
                          }
                        }}
                        className={cn(
                          "group relative flex w-full items-center gap-2 rounded-lg pl-2 pr-6 py-1.5 text-sm transition-colors cursor-pointer overflow-visible",
                          activeChat === chat.id
                            ? "bg-sidebar-accent text-sidebar-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                        )}
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1 min-w-0 truncate text-left">
                          {chat.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {chat.date}
                        </span>
                        <button
                          type="button"
                          aria-label="删除此条历史记录"
                          className="shrink-0 rounded p-0.5 text-destructive hover:bg-background/80 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={(e) => deleteHistory(chat.id, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

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
