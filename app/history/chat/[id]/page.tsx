"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatInput } from "@/components/chat-input";
import { ChatMessage, type Message } from "@/components/chat-message";
import { DisclosureWorkflow } from "@/components/workflows/disclosure-workflow";
import { Button } from "@/components/ui/button";
import { streamQAAnswer } from "@/lib/service/chat";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ChatHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [disclosureInitialStep, setDisclosureInitialStep] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);
  const [disclosureInitialData, setDisclosureInitialData] = useState<any>(undefined);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [historyRecordType, setHistoryRecordType] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, [chatId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const loadHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const response = await fetch(`/api/history/chat/${chatId}`);
      const data = await response.json();

      if (data.success && data.data) {
        const historyRecord = data.data;
        setHistoryRecordType(historyRecord.operation_type || "");
        
        if (historyRecord.operation_type === "disclosure") {
          // 专利交底书类型的历史记录
          if (historyRecord.operation_content) {
            try {
              const parsedContent = JSON.parse(historyRecord.operation_content);
              setDisclosureInitialStep(parsedContent.step || 1);
              setDisclosureInitialData(parsedContent);
              setShowDisclosure(true);
            } catch (e) {
              console.error("Failed to parse disclosure content:", e);
              setError("历史记录格式错误");
            }
          } else {
            setError("历史记录内容为空");
          }
        } else if (historyRecord.operation_content) {
          // 通用对话类型的历史记录
          try {
            const parsedContent = JSON.parse(historyRecord.operation_content);
            const historyMessages: Message[] = parsedContent.map((msg: any, index: number) => ({
              id: `${index}`,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(historyRecord.created_at),
            }));
            setMessages(historyMessages);
          } catch (e) {
            console.error("Failed to parse history content:", e);
            setError("历史记录格式错误");
          }
        } else {
          setError("历史记录内容为空");
        }
      } else {
        setError("历史记录不存在");
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      setError("加载历史记录失败");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSendMessage = async (content: string, tool?: string) => {
    console.log('History page handleSendMessage called', { content, tool, isLoading });
    
    if (isLoading) return;

    // 如果是专利交底书工具，直接打开工作流页面
    if (tool === "disclosure") {
      console.log('Opening disclosure workflow from history page');
      setShowDisclosure(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);
    setIsStreamActive(true);
    
    // 创建新的 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      const history = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const stream = await streamQAAnswer(content, history, abortController.signal);

      const assistantMsgId = (Date.now() + 1).toString();
      let assistantContent = "";

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      for await (const chunk of stream) {
        if (abortController.signal.aborted) {
          break;
        }
        if (chunk) {
          assistantContent += chunk;
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.findIndex(
              (m) => m.id === assistantMsgId,
            );
            if (lastIndex !== -1) {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: assistantContent,
              };
            }
            return newMessages;
          });
        }
      }

      // 保存历史记录（即使被中止也保存已生成的内容）
      if (assistantContent) {
        await saveHistoryRecord(content, assistantContent);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error("对话出错:", error);
        toast.error("发生错误，请稍后重试");
      }
    } finally {
      setIsLoading(false);
      setIsStreamActive(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreamActive(false);
    setIsLoading(false);
  };

  const saveHistoryRecord = async (userContent: string, assistantContent: string) => {
    try {
      const allMessages = [...messages, 
        { role: "user" as const, content: userContent },
        { role: "assistant" as const, content: assistantContent }
      ];

      const historyData: any = {
        operation_content: JSON.stringify(allMessages),
        operation_result: assistantContent,
      };

      if (messages.length === 0) {
        historyData.operation_title = userContent.substring(0, 50) + (userContent.length > 50 ? "..." : "");
      }

      await fetch(`/api/history/chat/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyData),
      });

      window.dispatchEvent(new CustomEvent('history-updated'));
    } catch (error) {
      console.error("保存历史记录失败:", error);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleBackFromWorkflow = () => {
    setShowDisclosure(false);
    setDisclosureInitialStep(undefined);
    setDisclosureInitialData(undefined);
  };

  // 如果正在进行专利交底书工作流，显示专用页面
  if (showDisclosure) {
    return (
      <DisclosureWorkflow
        key={chatId}
        fileName=""
        onBack={handleBackFromWorkflow}
        initialStep={disclosureInitialStep}
        initialData={disclosureInitialData}
        chatId={chatId}
      />
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToHome}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold">历史对话</span>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive text-lg mb-4">{error}</p>
            <Button onClick={handleBackToHome}>返回首页</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isHistoryLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToHome}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold">历史对话</span>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">加载历史记录中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToHome}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold">历史对话</span>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
          <div className="flex flex-col">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading &&
              messages[messages.length - 1]?.role === "user" && (
                <div className="flex w-full gap-4 px-4 py-6 bg-muted/30">
                  <div className="flex w-full max-w-3xl mx-auto gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          专利智能助手
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        正在思考...
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className="bg-background">
          <ChatInput 
            onSend={handleSendMessage} 
            isLoading={isLoading}
            onStop={handleStopStream}
          />
        </div>
      </main>
    </>
  );
}
