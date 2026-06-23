"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { PatentSearchResults } from "@/components/patent-search-results";
import { PatentItem } from "@/lib/types";

interface KeywordSearchWorkflowProps {
  onBack: () => void;
  initialQuery?: string;
  chatId?: string;
}

type KeywordSearchContextType = {
  query: string;
  setQuery: (query: string) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  results: PatentItem[];
  setResults: (results: PatentItem[]) => void;
  hasSearched: boolean;
  setHasSearched: (searched: boolean) => void;
  saveWorkflowState: () => void;
};

const KeywordSearchContext = createContext<KeywordSearchContextType | null>(null);

interface KeywordSearchProviderProps {
  children: ReactNode;
  initialQuery?: string;
  initialData?: any;
  chatId?: string;
}

export const KeywordSearchProvider = ({ children, initialQuery, initialData, chatId }: KeywordSearchProviderProps) => {
  const [query, setQuery] = useState<string>(initialData?.query || initialQuery || "");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [results, setResults] = useState<PatentItem[]>(initialData?.results || []);
  const [hasSearched, setHasSearched] = useState<boolean>(initialData?.hasSearched ?? !!initialQuery);

  const saveWorkflowState = async () => {
    if (!chatId) return;

    try {
      const workflowData = {
        query,
        isSearching,
        results,
        hasSearched,
      };

      const historyData = {
        operation_content: JSON.stringify(workflowData),
        operation_result: JSON.stringify(workflowData),
      };

      await fetch(`/api/history/chat/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyData),
      });

      window.dispatchEvent(new CustomEvent('history-updated'));
    } catch (error) {
      console.error("保存专利检索历史记录失败:", error);
    }
  };

  useEffect(() => {
    if (chatId) {
      saveWorkflowState();
    }
  }, [query, results, hasSearched, chatId]);

  const contextValue: KeywordSearchContextType = {
    query,
    setQuery,
    isSearching,
    setIsSearching,
    results,
    setResults,
    hasSearched,
    setHasSearched,
    saveWorkflowState,
  };

  return (
    <KeywordSearchContext.Provider value={contextValue}>
      {children}
    </KeywordSearchContext.Provider>
  );
};

export const useKeywordSearchContext = () => {
  const context = useContext(KeywordSearchContext);
  if (!context) {
    throw new Error("useKeywordSearchContext must be used within a KeywordSearchProvider");
  }
  return context;
};

// 模拟专利数据
const mockPatents: PatentItem[] = [
  {
    id: "1",
    title: "一种基于深度学习的图像识别方法",
    applicant: "某科技公司",
    publicationNumber: "CN112345678A",
    publicationDate: "2023-05-15",
    abstract:
      "本发明公开了一种基于深度学习的图像识别方法，包括：获取待识别图像；对所述待识别图像进行预处理；将预处理后的图像输入预先训练好的深度神经网络模型中，得到识别结果。本发明通过深度学习技术，提高了图像识别的准确率和效率。",
  },
  {
    id: "2",
    title: "机器学习模型训练系统及方法",
    applicant: "某研究院",
    publicationNumber: "CN112345679A",
    publicationDate: "2023-04-20",
    abstract:
      "本发明涉及一种机器学习模型训练系统及方法，所述系统包括：数据获取模块，用于获取训练数据；模型构建模块，用于构建机器学习模型；训练模块，用于利用所述训练数据对所述机器学习模型进行训练。本发明能够提高模型训练的效率和模型的性能。",
  },
  {
    id: "3",
    title: "神经网络优化算法",
    applicant: "某大学",
    publicationNumber: "CN112345680A",
    publicationDate: "2023-03-10",
    abstract:
      "本发明提出了一种神经网络优化算法，通过改进的梯度下降法对神经网络的权重进行更新，能够有效避免陷入局部最优解，提高神经网络的收敛速度和泛化能力。",
  },
];

export function KeywordSearchWorkflow({
  onBack,
  initialQuery = "",
  chatId,
}: KeywordSearchWorkflowProps) {
  const {
    query,
    setQuery,
    isSearching,
    setIsSearching,
    results,
    setResults,
    hasSearched,
    setHasSearched,
    saveWorkflowState,
  } = useKeywordSearchContext();

  const handleSearch = () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // 模拟搜索延迟
    setTimeout(() => {
      setResults(mockPatents);
      setIsSearching(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                专利检索
              </h2>
              <p className="text-xs text-muted-foreground">关键词检索</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="请输入关键词等进行检索..."
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? "检索中..." : "检索"}
            </Button>
          </div>

          {/* Results */}
          {hasSearched && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">检索结果</h3>
                <span className="text-sm text-muted-foreground">
                  找到 {results.length} 条结果
                </span>
              </div>

              {isSearching ? (
                <div className="py-10 text-center text-muted-foreground">
                  正在检索中...
                </div>
              ) : results.length > 0 ? (
                <PatentSearchResults results={results} />
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  未找到相关专利
                </div>
              )}
            </div>
          )}

          {!hasSearched && (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
              请输入关键词开始检索
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
