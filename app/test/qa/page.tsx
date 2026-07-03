"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SimpleChatInput } from "./simple-chat-input";
import { ChatThread } from "@/components/chat/chat-thread";
import { Eraser, FileSearch } from "lucide-react";
import { toast } from "sonner";
import { streamQAAnswer } from "@/lib/service/chat";
import type { ChatMessageData } from "@/components/chat/types";

export default function QAPage() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 清空对话
  const handleClearChat = () => {
    setMessages([]);
    toast.success("对话已清空");
  };

  const handleSend = async (content: string) => {
    if (isLoading) return;

    const userMsgId = Date.now().toString();
    const userMsg: ChatMessageData = {
      id: userMsgId,
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Optimistically add user message
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Prepare history (excluding current message)
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call Server Action
      const stream = await streamQAAnswer(content, history);

      // Create placeholder for assistant message
      const assistantMsgId = (Date.now() + 1).toString();
      let assistantContent = "";

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      // Iterate over the stream
      for await (const chunk of stream) {
        if (chunk) {
          assistantContent += chunk;
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.findIndex(
              (m) => m.id === assistantMsgId,
            );
            if (lastIndex !== -1) {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: assistantContent,
              };
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("对话出错:", error);
      toast.error("发生错误，请稍后重试");
    } finally {
      setIsLoading(false);
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
            disabled={messages.length === 0}
          >
            <Eraser data-icon="inline-start" />
            清空对话
          </Button>
        </header>

        {/* Chat Area */}
        <main className="flex flex-1 flex-col overflow-hidden max-h-[80vh]">
          <ChatThread
            messages={messages}
            isLoading={isLoading}
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
            <SimpleChatInput
              onSend={(content) => handleSend(content)}
              disabled={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
