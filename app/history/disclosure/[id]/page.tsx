"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DisclosureWorkflow } from "@/components/workflows/disclosure-workflow";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

export default function DisclosureHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [disclosureInitialStep, setDisclosureInitialStep] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);
  const [disclosureInitialData, setDisclosureInitialData] = useState<any>(undefined);

  useEffect(() => {
    loadHistory();
  }, [chatId]);

  const loadHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const response = await fetch(`/api/history/chat/${chatId}`);
      const data = await response.json();

      if (data.success && data.data) {
        const historyRecord = data.data;
        
        if (historyRecord.operation_type === "disclosure") {
          if (historyRecord.operation_content) {
            try {
              const parsedContent = JSON.parse(historyRecord.operation_content);
              setDisclosureInitialStep(parsedContent.step || 1);
              setDisclosureInitialData(parsedContent);
            } catch (e) {
              console.error("Failed to parse disclosure content:", e);
              setError("历史记录格式错误");
            }
          } else {
            setError("历史记录内容为空");
          }
        } else {
          setError("这不是专利交底书类型的历史记录");
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

  const handleBackToHome = () => {
    router.push("/");
  };

  if (isHistoryLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center gap-2 border-b px-4 py-3">
          <Button variant="ghost" size="icon" onClick={handleBackToHome}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">专利交底书</span>
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

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center gap-2 border-b px-4 py-3">
          <Button variant="ghost" size="icon" onClick={handleBackToHome}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">专利交底书</span>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={handleBackToHome}>
              返回首页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <DisclosureWorkflow
          initialStep={disclosureInitialStep}
          initialData={disclosureInitialData}
          chatId={chatId}
          onBack={handleBackToHome}
        />
      </div>
    </div>
  );
}
