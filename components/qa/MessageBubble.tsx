"use client";
import { Bot, User } from "lucide-react";
interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}>
        {/* 头像 */}
        <div className={`flex-shrink-0 ${isUser ? "ml-3" : "mr-3"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-blue-100" : "bg-green-100"
          }`}>
            {isUser ? (
              <User className="w-4 h-4 text-blue-600" />
            ) : (
              <Bot className="w-4 h-4 text-green-600" />
            )}
          </div>
        </div>   
        {/* 消息内容 */}
        <div className={isUser ? "text-right" : ""}>
          <div className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? "bg-blue-500 text-white rounded-tr-none" 
              : "bg-gray-100 text-gray-800 rounded-tl-none"
          }`}>
            <p className="whitespace-pre-wrap">{content}</p>
          </div>        
          {/* 时间戳 */}
          <span className="text-xs text-gray-400 mt-1 block">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}