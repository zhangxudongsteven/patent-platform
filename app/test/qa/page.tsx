"use client";

import { useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/chat-input";
import { ChatThread } from "@/components/chat/chat-thread";
import { Eraser, FileSearch } from "lucide-react";
import { toast } from "sonner";
import type { ChatSubmit } from "@/components/chat/types";

export default function QAPage() {
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

  // 清空对话
  const handleClearChat = () => {
    setMessages([]);
    toast.success("对话已清空");
  };

  const handleSend = async (content: string) => {
    if (isLoading) return;

    try {
      await sendMessage({ text: content });
    } catch (error) {
      console.error("对话出错:", error);
      toast.error("发生错误，请稍后重试");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-12 items-center justify-end border-b border-border bg-card px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-foreground"
            disabled={uiMessages.length === 0}
          >
            <Eraser data-icon="inline-start" />
            清空对话
          </Button>
        </header>

        {/* Chat Area */}
        <main className="flex flex-1 flex-col overflow-hidden max-h-[80vh]">
          <ChatThread
            messages={uiMessages}
            status={status}
            emptyState={
              <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                  <FileSearch className="text-primary" />
                </div>
                <h1 className="mb-2 text-2xl font-semibold text-foreground text-balance">
                  专利知识问答助手
                </h1>
                <p className="mb-6 max-w-md text-sm text-muted-foreground text-balance">
                  专业解答专利流程、制度、撰写等问题
                </p>

                {/* 快捷问题建议 */}
                <div className="flex max-w-2xl flex-wrap justify-center gap-2">
                  {[
                    "专利申报流程有哪些步骤？",
                    "如何撰写高质量的交底书？",
                    "专利检索常用的策略是什么？",
                    "发明专利和实用新型的区别？",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSend(suggestion)}
                      className="bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            }
          />

          {/* Chat Input Area */}
          <div className="bg-background">
            <ChatInput
              disabled={isLoading}
              onSubmit={(payload: ChatSubmit) => {
                if (payload.type !== "chat") {
                  return false;
                }
                void handleSend(payload.message);
                return true;
              }}
              placeholder="输入您的问题…"
              showTools={false}
              status={status}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
