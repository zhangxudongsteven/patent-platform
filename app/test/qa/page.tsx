"use client";
import { useState, useRef, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
// 定义消息类型
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};
export default function QAPage() {
  // 状态管理
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "您好！我是专利流程知识助手，请问有什么可以帮助您的？例如：专利申报流程、交底书撰写、专利检索等问题。",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  // 发送消息
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };  
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    try {
      // 准备对话历史（仅包含最近10轮对话，防止token超限）
      const recentHistory = updatedMessages
        .slice(-10)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
      // 调用API
      const response = await fetch("/api/qa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: input,
          chatHistory: recentHistory.slice(0, -1), // 不包含当前问题
          stream: false,
        }),
      });
      if (!response.ok) {
        throw new Error("请求失败");
      }
      const data = await response.json();
      if (data.success) {
        // 添加AI回复
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.data.answer,
          timestamp: new Date(),
        };   
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "未知错误");
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      toast.error("发送失败，请重试");
      // 添加错误消息
      const errorMessage: Message = {
        id: "error-" + Date.now(),
        role: "assistant",
        content: "抱歉，我遇到了些问题。请稍后再试或联系技术支持。",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  // 清空对话
  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "您好！我是专利流程知识助手，请问有什么可以帮助您的？",
        timestamp: new Date(),
      },
    ]);
    toast.success("对话已清空");
  };
  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="h-8 w-8 text-blue-500" />
              <div>
                <CardTitle className="text-2xl">专利知识问答助手</CardTitle>
                <CardDescription>
                  专业解答专利流程、制度、撰写等问题
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              清空对话
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* 消息区域 */}
          <ScrollArea 
            ref={scrollAreaRef}
            className="h-[500px] p-6"
          >
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-blue-50 border border-blue-100"
                        : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {message.role === "user" ? (
                          <User className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Bot className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium mb-1">
                          {message.role === "user" ? "您" : "专利助手"}
                          <span className="text-xs text-gray-400 ml-2">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Bot className="h-5 w-5 text-green-500" />
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-gray-500">正在思考...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          {/* 输入区域 */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="请输入关于专利流程的问题，例如：专利申报有哪些步骤？"
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                发送
              </Button>
            </div>
            {/* 快捷问题建议 */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">快捷提问：</span>
              {[
                "专利申报流程",
                "交底书怎么写",
                "如何检索专利",
                "专利保护期限"
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* 功能介绍 */}
      <div className="mt-6 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">功能说明：</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>多轮对话：AI会记住之前的对话内容</li>
          <li>专业领域：专注于专利流程、制度、撰写等专业问题</li>
          <li>上下文理解：基于对话历史提供连贯的回答</li>
          <li>实时响应：快速获取专业解答</li>
        </ul>
      </div>
    </div>
  );
}