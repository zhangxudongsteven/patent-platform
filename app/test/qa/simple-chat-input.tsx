"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入您的问题..."
          className="flex-1 resize-none bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[50px] max-h-[200px]"
          rows={1}
          disabled={disabled}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          className="mb-1 h-9 w-9 shrink-0 rounded-full"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">发送</span>
        </Button>
      </div>
    </div>
  );
}
