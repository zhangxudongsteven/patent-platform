"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { BookOpenText } from "lucide-react";

import { ChatMessage } from "@/components/chat-message";
import { ChatLoadingMessage } from "@/components/chat/chat-loading-message";
import type { ChatMessageData } from "@/components/chat/types";

interface ChatThreadProps {
  messages: ChatMessageData[];
  isLoading?: boolean;
  emptyState?: ReactNode;
}

function DefaultEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <BookOpenText />
      </div>
      <h1 className="mb-2 text-3xl font-semibold text-foreground text-balance">
        你好，我是专利智能助手
      </h1>
      <p className="max-w-md text-muted-foreground text-balance">
        我可以帮助您进行专利检索、撰写交底书、生成检索报告以及深度解析专利文献
      </p>
    </div>
  );
}

export function ChatThread({
  messages,
  isLoading = false,
  emptyState,
}: ChatThreadProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
      {messages.length === 0 ? (
        emptyState || <DefaultEmptyState />
      ) : (
        <div className="flex flex-col">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <ChatLoadingMessage />
          )}
        </div>
      )}
    </div>
  );
}
