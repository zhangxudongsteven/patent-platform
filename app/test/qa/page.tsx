"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SimpleChatInput } from "./simple-chat-input";
import { ChatMessage } from "@/components/chat-message";
import { Loader2, Eraser, FileSearch } from "lucide-react";
import { toast } from "sonner";
import { streamQAAnswer } from "@/lib/service/chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
  parts?: any[];
}

export default function QAPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // 清空对话
  const handleClearChat = () => {
    setMessages([]);
    toast.success("对话已清空");
  };

  const handleSend = async (content: string) => {
    if (isLoading) return;

    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content,
      createdAt: new Date(),
      parts: [{ type: "text", text: content }],
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
          createdAt: new Date(),
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
            <Eraser className="mr-2 h-4 w-4" />
            清空对话
          </Button>
        </header>

        {/* Chat Area */}
        <main className="flex flex-1 flex-col overflow-hidden max-h-[80vh]">
          <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              /* Welcome Message */
              <div className="flex h-full flex-col items-center justify-center text-center px-4 py-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <FileSearch className="h-6 w-6 text-blue-500" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2 text-balance">
                  专利知识问答助手
                </h1>
                <p className="text-sm text-muted-foreground max-w-md text-balance mb-6">
                  专业解答专利流程、制度、撰写等问题
                </p>

                {/* 快捷问题建议 */}
                <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
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
                      className="bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="flex flex-col">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={{
                      ...message,
                      timestamp: message.createdAt || new Date(),
                    }}
                  />
                ))}
                {isLoading &&
                  messages[messages.length - 1]?.role === "user" && (
                    <div className="flex w-full gap-4 px-4 py-6 bg-muted/30">
                      <div className="flex w-full max-w-3xl mx-auto gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              专利智能助手
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            正在思考...
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>

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
