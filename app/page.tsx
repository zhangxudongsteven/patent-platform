"use client";

import { useState } from "react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatInput } from "@/components/chat-input";
import { ChatThread } from "@/components/chat/chat-thread";
import { SearchFormulaWorkflow } from "@/components/workflows/search-formula-workflow";
import { ReportWorkflow } from "@/components/workflows/report-workflow";
import { DisclosureWorkflow } from "@/components/workflows/disclosure-workflow";
import { AnalysisWorkflow } from "@/components/workflows/analysis-workflow";
import { KeywordSearchWorkflow } from "@/components/workflows/keyword-search-workflow";
import { streamQAAnswer } from "@/lib/service/chat";
import { toast } from "sonner";
import { toolNames } from "@/components/chat/tool-config";
import type {
  ChatMessageData,
  ChatSubmit,
  ChatToolId,
} from "@/components/chat/types";

// 模拟 AI 回复
const getAIResponse = (userMessage: string, tool?: ChatToolId): string => {
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
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchFormula, setShowSearchFormula] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showKeywordSearch, setShowKeywordSearch] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleChatSubmit = async (payload: ChatSubmit) => {
    if (isLoading) return;

    if (payload.type === "workflow") {
      const fileNames = payload.files?.map((file) => file.name) ?? [];
      const firstFileName = fileNames[0] || "";

      if (payload.toolId === "patent-search") {
        setSearchQuery(payload.message || "");
        setShowKeywordSearch(true);
        return;
      }

      if (payload.toolId === "search-formula") {
        setUploadedFileName(firstFileName);
        setShowSearchFormula(true);
        return;
      }

      if (payload.toolId === "report") {
        setUploadedFileName(firstFileName);
        setShowReport(true);
        return;
      }

      if (payload.toolId === "disclosure") {
        setShowDisclosure(true);
        return;
      }

      if (payload.toolId === "analysis") {
        setUploadedFileNames(fileNames);
        setShowAnalysis(true);
        return;
      }
    }

    if (payload.type !== "chat") {
      return;
    }

    const content = payload.message;
    const tool = payload.toolId;

    if (!content.trim()) {
      return;
    }

    // 添加用户消息
    const userMessage: ChatMessageData = {
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
        const aiMessage: ChatMessageData = {
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
    setUploadedFileNames([]);
    setSearchQuery("");
  };

  const handleNewChat = () => {
    setMessages([]);
    handleBackFromWorkflow();
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
          <ChatThread messages={messages} isLoading={isLoading} />

          {/* Chat Input - Fixed at bottom */}
          <div className="bg-background">
            <ChatInput onSubmit={handleChatSubmit} />
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
