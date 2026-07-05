"use client";

import type { ChatStatus, UIMessage } from "ai";
import { BookOpenText } from "lucide-react";
import type { ReactNode } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { ChatMessage, isVisibleMessagePart } from "@/components/chat-message";
import { ChatLoadingMessage } from "@/components/chat/chat-loading-message";

interface ChatThreadProps {
  messages: UIMessage[];
  status?: ChatStatus;
  emptyState?: ReactNode;
}

export function DefaultEmptyState() {
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

export function hasRenderableContent(message: UIMessage) {
  return message.parts.some(isVisibleMessagePart);
}

export function hasVisibleChatContent(message: UIMessage) {
  return (
    (message.role === "user" || message.role === "assistant") &&
    hasRenderableContent(message)
  );
}

export function ChatThread({
  messages,
  status = "ready",
  emptyState,
}: ChatThreadProps) {
  const visibleMessages = messages.filter(hasVisibleChatContent);
  const isLoading = status === "submitted" || status === "streaming";
  const isStreaming = status === "streaming";
  const lastVisibleMessage = visibleMessages[visibleMessages.length - 1];

  return (
    <Conversation className="flex-1">
      <ConversationContent className="gap-0 p-0">
        {visibleMessages.length === 0 ? (
          <div className="flex min-h-full flex-1 flex-col">
            {emptyState || <DefaultEmptyState />}
          </div>
        ) : (
          <>
            {visibleMessages.map((message, index) => (
              <ChatMessage
                isLastMessage={index === visibleMessages.length - 1}
                isStreaming={isStreaming}
                key={message.id}
                message={message}
              />
            ))}
            {isLoading && lastVisibleMessage?.role === "user" && (
              <ChatLoadingMessage />
            )}
          </>
        )}
      </ConversationContent>
      <ConversationScrollButton
        className="absolute right-4 bottom-4 rounded-full shadow-md"
        size="icon"
        variant="secondary"
      />
    </Conversation>
  );
}
