"use client";

import { ChatSidebar } from "@/components/chat-sidebar";
import { useRouter, usePathname } from "next/navigation";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNewChat = () => {
    if (pathname === "/") {
      window.dispatchEvent(new CustomEvent('new-chat'));
    } else {
      router.push("/");
    }
  };

  const handleChatClick = (chat: any) => {
    if (chat.operationType === "disclosure") {
      router.push("/");
      setTimeout(() => {
        const event = new CustomEvent('load-disclosure-history', { 
          detail: { 
            chatId: chat.chatId,
            workflowStep: chat.workflowStep,
            fullContent: chat.fullContent 
          } 
        });
        window.dispatchEvent(event);
      }, 100);
    } else if (chat.operationType === "report") {
      router.push("/");
      setTimeout(() => {
        const event = new CustomEvent('load-report-history', { 
          detail: { 
            chatId: chat.chatId,
            workflowStep: chat.workflowStep,
            fullContent: chat.fullContent 
          } 
        });
        window.dispatchEvent(event);
      }, 100);
    } else if (chat.operationType === "patent-search") {
      router.push("/");
      setTimeout(() => {
        const event = new CustomEvent('load-patent-search-history', { 
          detail: { 
            chatId: chat.chatId,
            workflowStep: chat.workflowStep,
            fullContent: chat.fullContent 
          } 
        });
        window.dispatchEvent(event);
      }, 100);
    } else if (chat.operationType === "analysis") {
      router.push("/");
      setTimeout(() => {
        const event = new CustomEvent('load-analysis-history', { 
          detail: { 
            chatId: chat.chatId,
            workflowStep: chat.workflowStep,
            fullContent: chat.fullContent 
          } 
        });
        window.dispatchEvent(event);
      }, 100);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar onNewChat={handleNewChat} onChatClick={handleChatClick} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}