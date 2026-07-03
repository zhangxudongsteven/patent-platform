"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SimpleChatInputProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
}

export function SimpleChatInput({ onSend, disabled }: SimpleChatInputProps) {
  const [message, setMessage] = React.useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend?.(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      <div className="relative rounded-2xl border border-border bg-card shadow-lg p-2 flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入您的问题…"
          name="qa-question"
          className="max-h-[200px] min-h-[50px] flex-1 resize-none border-0 bg-transparent px-4 py-3 shadow-none focus-visible:ring-0"
          rows={1}
          disabled={disabled}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          className="mb-1 shrink-0 rounded-full"
        >
          <Send data-icon="icon" />
          <span className="sr-only">发送</span>
        </Button>
      </div>
    </div>
  );
}
