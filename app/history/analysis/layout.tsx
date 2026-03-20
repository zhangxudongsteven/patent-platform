"use client";

import { ChatSidebar } from "@/components/chat-sidebar";
import { useRouter } from "next/navigation";

export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleNewChat = () => {
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar onNewChat={handleNewChat} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
