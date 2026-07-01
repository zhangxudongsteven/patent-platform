"use client";

import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tool?: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-4 px-4 py-6",
        isUser ? "bg-background" : "bg-muted/30",
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl gap-4">
        <Avatar
          className={cn(
            "size-8 rounded-lg",
            isUser
              ? "bg-primary/10 text-primary"
              : "bg-primary text-primary-foreground",
          )}
        >
          <AvatarFallback className="rounded-lg bg-transparent">
            {isUser ? <User /> : <Bot />}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col gap-2 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {isUser ? "你" : "专利智能助手"}
            </span>
            {message.tool && (
              <Badge variant="secondary" className="font-normal">
                {message.tool}
              </Badge>
            )}
          </div>
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
