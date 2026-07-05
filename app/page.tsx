"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatInput } from "@/components/chat-input";
import {
  ChatThread,
  DefaultEmptyState,
  hasVisibleChatContent,
} from "@/components/chat/chat-thread";
import { SearchFormulaWorkflow } from "@/components/workflows/search-formula-workflow";
import { ReportWorkflow } from "@/components/workflows/report-workflow";
import { DisclosureWorkflow } from "@/components/workflows/disclosure-workflow";
import { AnalysisWorkflow } from "@/components/workflows/analysis-workflow";
import { KeywordSearchWorkflow } from "@/components/workflows/keyword-search-workflow";
import { toast } from "sonner";
import type { ChatSubmit } from "@/components/chat/types";

type ActiveWorkflow =
  | { type: "keyword-search"; query: string }
  | { type: "search-formula"; fileName: string }
  | { type: "report"; fileName: string }
  | { type: "disclosure"; fileName: string }
  | { type: "analysis"; fileNames: string[] };

export default function Home() {
  const [activeWorkflow, setActiveWorkflow] = useState<ActiveWorkflow | null>(
    null,
  );
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );
  const {
    messages: uiMessages,
    sendMessage,
    setMessages,
    status,
  } = useChat({
    transport,
    onError: (error) => {
      console.error("对话出错:", error);
      toast.error("发生错误，请稍后重试");
    },
  });
  const isLoading = status === "submitted" || status === "streaming";
  const hasMessages = uiMessages.some(hasVisibleChatContent);

  const handleChatSubmit = async (payload: ChatSubmit) => {
    if (isLoading) return false;

    if (payload.type === "workflow") {
      const fileNames = payload.files?.map((file) => file.name) ?? [];
      const firstFileName = fileNames[0] || "";

      if (payload.toolId === "patent-search") {
        setActiveWorkflow({
          type: "keyword-search",
          query: payload.message || "",
        });
        return true;
      }

      if (payload.toolId === "search-formula") {
        setActiveWorkflow({
          type: "search-formula",
          fileName: firstFileName,
        });
        return true;
      }

      if (payload.toolId === "report") {
        setActiveWorkflow({
          type: "report",
          fileName: firstFileName,
        });
        return true;
      }

      if (payload.toolId === "disclosure") {
        setActiveWorkflow({
          type: "disclosure",
          fileName: firstFileName,
        });
        return true;
      }

      if (payload.toolId === "analysis") {
        setActiveWorkflow({
          type: "analysis",
          fileNames,
        });
        return true;
      }
    }

    if (payload.type !== "chat") {
      return false;
    }

    const content = payload.message;

    if (!content.trim()) {
      return false;
    }

    void sendMessage({ text: content.trim() });
    return true;
  };

  const handleBackFromWorkflow = () => {
    setActiveWorkflow(null);
  };

  const handleNewChat = () => {
    setMessages([]);
    handleBackFromWorkflow();
    toast.success("对话已重置");
  };

  // 如果正在进行专利检索式工作流，显示专用页面
  if (activeWorkflow?.type === "search-formula") {
    return (
      <div className="flex h-screen bg-background">
        <ChatSidebar />
        <div className="flex flex-1 flex-col">
          <SearchFormulaWorkflow
            fileName={activeWorkflow.fileName}
            onBack={handleBackFromWorkflow}
          />
        </div>
      </div>
    );
  }

  // 如果正在进行专利检索报告工作流，显示专用页面
  if (activeWorkflow?.type === "report") {
    return (
      <div className="flex h-screen bg-background">
        <ChatSidebar />
        <div className="flex flex-1 flex-col">
          <ReportWorkflow
            fileName={activeWorkflow.fileName}
            onBack={handleBackFromWorkflow}
          />
        </div>
      </div>
    );
  }

  // 如果正在进行专利交底书工作流，显示专用页面
  if (activeWorkflow?.type === "disclosure") {
    return (
      <div className="flex h-screen bg-background">
        <ChatSidebar />
        <div className="flex flex-1 flex-col">
          <DisclosureWorkflow
            fileName={activeWorkflow.fileName}
            onBack={handleBackFromWorkflow}
          />
        </div>
      </div>
    );
  }

  // 如果正在进行专利解析工作流，显示专用页面
  if (activeWorkflow?.type === "analysis") {
    return (
      <div className="flex h-screen bg-background">
        <ChatSidebar />
        <div className="flex flex-1 flex-col">
          <AnalysisWorkflow
            fileNames={activeWorkflow.fileNames}
            onBack={handleBackFromWorkflow}
          />
        </div>
      </div>
    );
  }

  // 如果正在进行关键词搜索工作流，显示专用页面
  if (activeWorkflow?.type === "keyword-search") {
    return (
      <div className="flex h-screen bg-background">
        <ChatSidebar />
        <div className="flex flex-1 flex-col">
          <KeywordSearchWorkflow
            initialQuery={activeWorkflow.query}
            onBack={handleBackFromWorkflow}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar onNewChat={handleNewChat} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center justify-end border-b border-border bg-card px-4"></header>

        {/* Chat Area */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {hasMessages ? (
            <>
              <ChatThread messages={uiMessages} status={status} />

              {/* Chat Input - Fixed at bottom */}
              <div className="bg-background">
                <ChatInput
                  disabled={isLoading}
                  onSubmit={handleChatSubmit}
                  status={status}
                />
              </div>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-8">
              <div className="flex w-full max-w-3xl flex-col items-center gap-10">
                <DefaultEmptyState />
                <ChatInput
                  className="px-0 pb-0"
                  disabled={isLoading}
                  onSubmit={handleChatSubmit}
                  status={status}
                />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-center py-3 text-xs text-muted-foreground">
          <span>专利智能助手由AI技术驱动，生成内容供参考</span>
        </footer>
      </div>
    </div>
  );
}
