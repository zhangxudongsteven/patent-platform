"use client";

import type {
  DynamicToolUIPart,
  FileUIPart,
  SourceDocumentUIPart,
  SourceUrlUIPart,
  ToolUIPart,
  UIMessage,
} from "ai";
import { Bot, FileText, User } from "lucide-react";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: UIMessage;
  isLastMessage?: boolean;
  isStreaming?: boolean;
}

type MessagePart = UIMessage["parts"][number];

function getPartRecord(part: MessagePart) {
  return part as unknown as Record<string, unknown>;
}

function getMessageTool(message: UIMessage) {
  const metadata = message.metadata;

  if (!metadata || typeof metadata !== "object" || !("tool" in metadata)) {
    return null;
  }

  return typeof metadata.tool === "string" ? metadata.tool : null;
}

function ReasoningParts({
  message,
  isLastMessage,
  isStreaming,
}: {
  message: UIMessage;
  isLastMessage: boolean;
  isStreaming: boolean;
}) {
  const reasoningParts = message.parts.filter(
    (part) => part.type === "reasoning",
  );
  const reasoningText = reasoningParts.map((part) => part.text).join("\n\n");

  if (!reasoningText.trim()) {
    return null;
  }

  const lastPart = message.parts.at(-1);
  const isReasoningStreaming =
    isLastMessage && isStreaming && lastPart?.type === "reasoning";

  return (
    <Reasoning className="w-full" isStreaming={isReasoningStreaming}>
      <ReasoningTrigger />
      <ReasoningContent>{reasoningText}</ReasoningContent>
    </Reasoning>
  );
}

function ToolPartView({ part }: { part: ToolUIPart | DynamicToolUIPart }) {
  const output =
    typeof part.output === "string" ? (
      <MessageResponse>{part.output}</MessageResponse>
    ) : (
      part.output
    );

  return (
    <Tool defaultOpen={part.state === "output-error"}>
      {part.type === "dynamic-tool" ? (
        <ToolHeader
          state={part.state}
          toolName={part.toolName}
          type={part.type}
        />
      ) : (
        <ToolHeader state={part.state} type={part.type} />
      )}
      <ToolContent>
        {"input" in part && part.input !== undefined && (
          <ToolInput input={part.input} />
        )}
        <ToolOutput errorText={part.errorText} output={output} />
      </ToolContent>
    </Tool>
  );
}

function FilePartView({
  part,
}: {
  part: FileUIPart | SourceDocumentUIPart | SourceUrlUIPart;
}) {
  const record = getPartRecord(part);
  const title =
    (typeof record.filename === "string" && record.filename) ||
    (typeof record.title === "string" && record.title) ||
    (typeof record.url === "string" && record.url) ||
    "附件";
  const mediaType =
    typeof record.mediaType === "string" ? record.mediaType : part.type;

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
      <FileText className="size-4 text-primary" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{title}</div>
        <div className="truncate text-xs text-muted-foreground">
          {mediaType}
        </div>
      </div>
      {typeof record.url === "string" && (
        <a
          className="text-xs text-primary underline-offset-4 hover:underline"
          href={record.url}
          rel="noreferrer"
          target="_blank"
        >
          打开
        </a>
      )}
    </div>
  );
}

export function isVisibleMessagePart(part: MessagePart) {
  if (part.type === "text" || part.type === "reasoning") {
    return part.text.trim().length > 0;
  }

  if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) {
    return true;
  }

  if (part.type === "file" || part.type.startsWith("source-")) {
    return true;
  }

  return false;
}

function MessagePartView({ part }: { part: MessagePart }) {
  if (part.type === "text") {
    return part.text.trim() ? (
      <MessageResponse>{part.text}</MessageResponse>
    ) : null;
  }

  if (part.type === "reasoning") {
    return null;
  }

  if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) {
    return <ToolPartView part={part as ToolUIPart | DynamicToolUIPart} />;
  }

  if (part.type === "file" || part.type.startsWith("source-")) {
    return (
      <FilePartView
        part={part as FileUIPart | SourceDocumentUIPart | SourceUrlUIPart}
      />
    );
  }

  return null;
}

export function ChatMessage({
  message,
  isLastMessage = false,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const messageTool = getMessageTool(message);

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

        <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {isUser ? "你" : "专利智能助手"}
            </span>
            {messageTool && (
              <Badge
                className="max-w-full truncate font-normal"
                variant="secondary"
              >
                {messageTool}
              </Badge>
            )}
          </div>

          <Message className="max-w-full" from={message.role}>
            <MessageContent className="w-full max-w-full">
              <ReasoningParts
                isLastMessage={isLastMessage}
                isStreaming={isStreaming}
                message={message}
              />
              {message.parts.map((part, index) => (
                <MessagePartView
                  key={`${message.id}-${part.type}-${index}`}
                  part={part}
                />
              ))}
            </MessageContent>
          </Message>
        </div>
      </div>
    </div>
  );
}
