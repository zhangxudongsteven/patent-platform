"use client";

import { useState, useRef, useEffect } from "react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatInput } from "@/components/chat-input";
import { ChatMessage, type Message } from "@/components/chat-message";
import { SearchFormulaWorkflow } from "@/components/workflows/search-formula-workflow";
import { ReportWorkflow } from "@/components/workflows/report-workflow";
import { DisclosureWorkflow } from "@/components/workflows/disclosure-workflow";
import { AnalysisWorkflow } from "@/components/workflows/analysis-workflow";
import { KeywordSearchWorkflow } from "@/components/workflows/keyword-search-workflow";
import { Button } from "@/components/ui/button";
import { streamQAAnswer } from "@/lib/service/chat";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// 工具名称映射
const toolNames: Record<string, string> = {
  "patent-search": "专利检索",
  "search-formula": "专利检索式",
  disclosure: "专利交底书",
  report: "专利检索报告",
  analysis: "专利解析",
};

// 模拟 AI 回复
const getAIResponse = (userMessage: string, tool?: string): string => {
  if (tool === "patent-search") {
    return "我将为您进行全库专利检索。支持的检索方式包括：\n\n1. 关键词检索\n2. 申请人/发明人检索\n3. 分类号检索\n4. 语义检索\n\n请输入您想要检索的内容，例如“人工智能 图像识别”或“华为技术有限公司”。";
  }
  if (tool === "search-formula") {
    return "根据您的需求，我为您生成以下专利检索式：\n\n(发明名称 OR 摘要) AND (技术特征 OR 关键词) AND (IPC分类号)\n\n这个检索式可以帮助您在专利数据库中精准定位相关技术。建议在使用时根据具体情况调整关键词和分类号。";
  }
  if (tool === "disclosure") {
    return "我将帮助您撰写专利交底书。专利交底书通常包含以下部分：\n\n1. 技术领域\n2. 背景技术\n3. 发明内容\n4. 附图说明\n5. 具体实施方式\n\n请提供您的技术方案详细信息，我将协助您完成各部分内容的撰写。";
  }
  if (tool === "report") {
    return "我将为您生成专利检索报告。报告将包括：\n\n1. 检索策略说明\n2. 相关专利列表\n3. 技术对比分析\n4. 新颖性评估\n5. 专利布局建议\n\n请提供您需要检索的技术主题和关键词。";
  }
  if (tool === "analysis") {
    return "我将为您深度解析专利文献。分析内容包括：\n\n1. 技术问题\n2. 技术手段\n3. 技术效果\n\n请提供需要分析的专利号或上传专利文件。";
  }

  return "您好！我是专利智能助手，专注于为您提供专利相关的专业服务。我可以帮助您：\n\n• 生成精准的专利检索式\n• 撰写规范的专利交底书\n• 制作详细的专利检索报告\n• 深度解析专利技术方案\n\n请告诉我您需要什么帮助，或选择底部的专业工具开始使用。";
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchFormula, setShowSearchFormula] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showKeywordSearch, setShowKeywordSearch] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string, tool?: string) => {
    if (isLoading) return;

    // 如果是专利检索工具，直接打开关键词搜索工作流页面
    if (tool === "patent-search") {
      setSearchQuery(content);
      setShowKeywordSearch(true);
      return;
    }

    // 如果是专利检索式工具且上传了文件，打开专用工作流页面
    if (tool === "search-formula" && content.startsWith("已上传文件：")) {
      const fileName = content.replace("已上传文件：", "");
      setUploadedFileName(fileName);
      setShowSearchFormula(true);
      return;
    }

    // 如果是专利检索报告工具且上传了文件，打开专用工作流页面
    if (tool === "report" && content.startsWith("已上传文件：")) {
      const fileName = content.replace("已上传文件：", "");
      setUploadedFileName(fileName);
      setShowReport(true);
      return;
    }

    // 如果是专利交底书工具，直接打开工作流页面
    if (tool === "disclosure") {
      setShowDisclosure(true);
      return;
    }

    // 如果是专利解析工具且上传了文件，打开专用工作流页面
    if (tool === "analysis" && content.startsWith("已上传文件：")) {
      const fileNamesStr = content.replace("已上传文件：", "");
      const fileNames = fileNamesStr.split("、");
      setUploadedFileNames(fileNames);
      setShowAnalysis(true);
      return;
    }

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      tool: tool ? toolNames[tool] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);

    // 如果有具体的 tool（但没有触发工作流），使用静态引导回复
    if (tool) {
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: getAIResponse(content, tool),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }, 500);
      return;
    }

    // 默认对话模式：调用 Server Action
    setIsLoading(true);
    try {
      // 准备历史记录 (去除当前这条，因为 Server Action 签名是 question + history)
      // 注意：这里 history 应该包含之前的 user 和 assistant 消息
      const history = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const stream = await streamQAAnswer(content, history);

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
    } catch (error) {
      console.error("对话出错:", error);
      toast.error("发生错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromWorkflow = () => {
    setShowSearchFormula(false);
    setShowReport(false);
    setShowDisclosure(false);
    setShowAnalysis(false);
    setShowKeywordSearch(false);
    setUploadedFileName("");
    setSearchQuery("");
  };

  const handleNewChat = () => {
    setMessages([]);
    handleBackFromWorkflow();
    setUploadedFileNames([]);
    toast.success("对话已重置");
  };

  // 如果正在进行专利检索式工作流，显示专用页面
  if (showSearchFormula) {
    return (
      <div className="flex h-screen bg-background">
        <ChatSidebar />
        <div className="flex flex-1 flex-col">
          <SearchFormulaWorkflow
            fileName={uploadedFileName}
            onBack={handleBackFromWorkflow}
          />
        </div>
      </div>
    );
  }

  // 如果正在进行专利检索报告工作流，显示专用页面
  if (showReport) {
    return (
      <div className="flex h-screen bg-background">
        <ChatSidebar />
        <div className="flex flex-1 flex-col">
          <ReportWorkflow
            fileName={uploadedFileName}
            onBack={handleBackFromWorkflow}
          />
        </div>
      </div>
    );
  }

  // 如果正在进行专利交底书工作流，显示专用页面
  if (showDisclosure) {
    return (
      <div className="flex h-screen bg-background">
        <ChatSidebar />
        <div className="flex flex-1 flex-col">
          <DisclosureWorkflow
            fileName={uploadedFileName}
            onBack={handleBackFromWorkflow}
          />
        </div>
      </div>
    );
  }

  // 如果正在进行专利解析工作流，显示专用页面
  if (showAnalysis) {
    return (
      <div className="flex h-screen bg-background">
        <ChatSidebar />
        <div className="flex flex-1 flex-col">
          <AnalysisWorkflow
            fileNames={uploadedFileNames}
            onBack={handleBackFromWorkflow}
          />
        </div>
      </div>
    );
  }

  // 如果正在进行关键词搜索工作流，显示专用页面
  if (showKeywordSearch) {
    return (
      <div className="flex h-screen bg-background">
        <ChatSidebar />
        <div className="flex flex-1 flex-col">
          <KeywordSearchWorkflow
            initialQuery={searchQuery}
            onBack={handleBackFromWorkflow}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar onNewChat={handleNewChat} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center justify-end border-b border-border bg-card px-4"></header>

        {/* Chat Area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
            {messages.length === 0 ? (
              /* Welcome Message */
              <div className="flex h-full flex-col items-center justify-center text-center px-4">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-8 w-8 text-primary"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h1 className="text-3xl font-semibold text-foreground mb-2 text-balance">
                  你好，我是专利智能助手
                </h1>
                <p className="text-muted-foreground max-w-md text-balance">
                  我可以帮助您进行专利检索、撰写交底书、生成检索报告以及深度解析专利文献
                </p>
              </div>
            ) : (
              /* Chat Messages */
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
            )}
          </div>

          {/* Chat Input - Fixed at bottom */}
          <div className="bg-background">
            <ChatInput onSend={handleSendMessage} />
          </div>
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-center py-3 text-xs text-muted-foreground">
          <span>专利智能助手由AI技术驱动，生成内容供参考</span>
        </footer>
      </div>
    </div>
  );
}
