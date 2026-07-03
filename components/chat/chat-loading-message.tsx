"use client";

import { Bot } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";

export function ChatLoadingMessage() {
  return (
    <div className="flex w-full gap-4 bg-muted/30 px-4 py-6">
      <div className="mx-auto flex w-full max-w-3xl gap-4">
        <Avatar className="size-8 rounded-lg bg-primary text-primary-foreground">
          <AvatarFallback className="rounded-lg bg-transparent">
            <Bot />
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              专利智能助手
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            正在思考…
          </div>
        </div>
      </div>
    </div>
  );
}
