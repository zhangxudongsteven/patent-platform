"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  FileText,
  Tags,
  BookOpen,
  Plus,
  X,
  Search,
  Lightbulb,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { PatentSearchResults } from "@/components/patent-search-results";
import { PatentItem } from "@/lib/types";

interface SearchFormulaWorkflowProps {
  fileName: string;
  onBack: () => void;
  chatId?: string;
}

interface IPCItem {
  code: string;
  name: string;
  selected?: boolean;
}

interface KeywordItem {
  word: string;
  selected?: boolean;
}

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  example: string;
}

type SearchFormulaWorkflowContextType = {
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;
  ipcList: any[];
  setIPCList: (list: any[]) => void;
  keywords: any[];
  setKeywords: (list: any[]) => void;
  generatedFormula: string;
  setGeneratedFormula: (formula: string) => void;
  searchResults: PatentItem[];
  setSearchResults: (results: PatentItem[]) => void;
  originalSearchResults: PatentItem[];
  setOriginalSearchResults: (results: PatentItem[]) => void;
  saveWorkflowState: () => void;
};

const SearchFormulaContext = createContext<SearchFormulaWorkflowContextType | null>(
  null,
);

interface SearchFormulaProviderProps {
  children: ReactNode;
  initialStep?: 1 | 2 | 3;
  initialData?: any;
  chatId?: string;
}

export const SearchFormulaProvider = ({ children, initialStep, initialData, chatId }: SearchFormulaProviderProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(initialStep || 1);
  const [ipcList, setIPCList] = useState<any[]>(initialData?.ipcList || [
    { code: "G06F", name: "电数字数据处理", selected: true },
    { code: "G06N", name: "基于特定计算模型的计算机系统", selected: true },
    { code: "G06Q", name: "专门适用于行政、商业、金融、管理、监督或预测目的的数据处理系统或方法", selected: true },
  ]);
  const [keywords, setKeywords] = useState<any[]>(initialData?.keywords || [
    { word: "人工智能", selected: true },
    { word: "机器学习", selected: true },
    { word: "深度学习", selected: true },
    { word: "神经网络", selected: true },
    { word: "算法", selected: true },
  ]);
  const [generatedFormula, setGeneratedFormula] = useState<string>(initialData?.generatedFormula || "");
  const [searchResults, setSearchResults] = useState<PatentItem[]>(initialData?.searchResults || []);
  const [originalSearchResults, setOriginalSearchResults] = useState<PatentItem[]>(initialData?.originalSearchResults || []);

  const saveWorkflowState = async () => {
    if (!chatId) return;

    try {
      const workflowData = {
        step,
        ipcList,
        keywords,
        generatedFormula,
        searchResults,
        originalSearchResults,
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
      console.error("保存专利检索式历史记录失败:", error);
    }
  };

  useEffect(() => {
    if (chatId && step >= 1) {
      saveWorkflowState();
    }
  }, [step, ipcList, keywords, generatedFormula, searchResults, originalSearchResults, chatId]);

  const contextValue: SearchFormulaWorkflowContextType = {
    step,
    setStep,
    ipcList,
    setIPCList,
    keywords,
    setKeywords,
    generatedFormula,
    setGeneratedFormula,
    searchResults,
    setSearchResults,
    originalSearchResults,
    setOriginalSearchResults,
    saveWorkflowState,
  };

  return (
    <SearchFormulaContext.Provider value={contextValue}>
      {children}
    </SearchFormulaContext.Provider>
  );
};

export const useSearchFormulaContext = () => {
  const context = useContext(SearchFormulaContext);
  if (!context) {
    throw new Error(
      "useSearchFormulaContext must be used within a SearchFormulaProvider",
    );
  }
  return context;
};

// 模拟数据
const mockIPCList: IPCItem[] = [
  { code: "G06F", name: "电数字数据处理", selected: true },
  { code: "G06N", name: "基于特定计算模型的计算机系统", selected: true },
  {
    code: "G06Q",
    name: "专门适用于行政、商业、金融、管理、监督或预测目的的数据处理系统或方法",
    selected: true,
  },
];

const mockKeywords: KeywordItem[] = [
  { word: "人工智能", selected: true },
  { word: "机器学习", selected: true },
  { word: "深度学习", selected: true },
  { word: "神经网络", selected: true },
  { word: "算法", selected: true },
];

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

// 完整的 IPC 建议库（用于输入时推荐）
const ipcSuggestions: IPCItem[] = [
  { code: "G06F", name: "电数字数据处理" },
  { code: "G06N", name: "基于特定计算模型的计算机系统" },
  {
    code: "G06Q",
    name: "专门适用于行政、商业、金融、管理、监督或预测目的的数据处理系统或方法",
  },
  { code: "H04L", name: "数字信息的传输" },
  { code: "G06K", name: "数据识别；数据表示；记录载体" },
  { code: "G06T", name: "一般的图像数据处理或产生" },
  { code: "H04N", name: "图像通信" },
  { code: "G06V", name: "图像或视频识别或理解" },
  { code: "H04W", name: "无线通信网络" },
  { code: "G06F16", name: "信息检索；数据库结构" },
  { code: "G06F21", name: "保护计算机或计算机系统免受未授权活动" },
  {
    code: "G06F3",
    name: "用于将数据从特定形式转换到计算机可以处理的形式的输入装置",
  },
];

const mockExtendedWords: KeywordItem[] = [
  { word: "AI", selected: false },
  { word: "ML", selected: false },
  { word: "DL", selected: false },
  { word: "NN", selected: false },
  { word: "方法", selected: false },
  { word: "数据分析", selected: false },
  { word: "训练方法", selected: false },
];

// 扩展词建议映射（根据关键词提供建议）
const keywordSuggestions: Record<string, string[]> = {
  人工智能: ["AI", "智能系统", "认知计算"],
  机器学习: ["ML", "自动学习", "统计学习"],
  深度学习: ["DL", "神经网络", "表示学习"],
  神经网络: ["NN", "深度网络", "卷积网络"],
  算法: ["方法", "模型", "技术"],
  数据处理: ["数据分析", "信息处理", "数据挖掘"],
  模型训练: ["训练方法", "学习过程", "优化训练"],
};

const templates: TemplateOption[] = [
  {
    id: "ipc-keywords",
    name: "IncoPat | IPC/CPC + Keywords",
    description: "使用 IPC/CPC 分类号与关键词组合进行检索",
    example:
      "(IPC=G06F OR IPC=G06N) AND (TI=人工智能 OR AB=人工智能 OR TI=机器学习 OR AB=机器学习)",
  },
  {
    id: "keywords-only",
    name: "IncoPat | Keywords",
    description: "仅使用关键词进行检索",
    example:
      "(TI=人工智能 OR AB=人工智能 OR TI=机器学习 OR AB=机器学习 OR TI=深度学习 OR AB=深度学习)",
  },
];

export function SearchFormulaWorkflow({
  fileName,
  onBack,
  chatId,
}: SearchFormulaWorkflowProps) {
  const { step, setStep, ipcList, setIPCList, keywords, setKeywords, generatedFormula, setGeneratedFormula, searchResults, setSearchResults, originalSearchResults, setOriginalSearchResults } = useSearchFormulaContext();
  
  const [extendedWords, setExtendedWords] =
    useState<KeywordItem[]>(mockExtendedWords);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Manual input states
  const [showIPCInput, setShowIPCInput] = useState(false);
  const [newIPCCode, setNewIPCCode] = useState("");
  const [newIPCName, setNewIPCName] = useState("");
  const [showKeywordInput, setShowKeywordInput] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [suggestedWords, setSuggestedWords] = useState<string[]>([]);
  const [filteredIPCSuggestions, setFilteredIPCSuggestions] = useState<
    IPCItem[]
  >([]);
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);

  const handleIPCInputChange = (value: string) => {
    setNewIPCCode(value);

    // Filter suggestions based on input
    if (value.trim()) {
      const filtered = ipcSuggestions.filter(
        (ipc) =>
          !ipcList.find((existing) => existing.code === ipc.code) &&
          (ipc.code.toLowerCase().includes(value.toLowerCase()) ||
            ipc.name.toLowerCase().includes(value.toLowerCase())),
      );
      setFilteredIPCSuggestions(filtered.slice(0, 6)); // Show max 6 suggestions
    } else {
      setFilteredIPCSuggestions([]);
    }
  };

  const addIPC = (ipc: IPCItem) => {
    // Only add from suggestion list
    setIPCList([...ipcList, ipc]);
    setNewIPCCode("");
    setFilteredIPCSuggestions([]);
  };

  const addKeyword = (word: string) => {
    if (word.trim() && !keywords.find((kw) => kw.word === word.trim())) {
      setKeywords([...keywords, { word: word.trim() }]);

      // Show suggestions for newly added keyword
      const suggestions = keywordSuggestions[word.trim()] || [];
      setSuggestedWords(suggestions);

      setNewKeyword("");
    }
  };

  const addSuggestedWord = (word: string) => {
    if (!keywords.find((kw) => kw.word === word)) {
      setKeywords([...keywords, { word }]);
      // Remove the added word from suggestions
      const updatedSuggestions = suggestedWords.filter((w) => w !== word);
      setSuggestedWords(updatedSuggestions);
      // Clear active keyword if no more suggestions
      if (updatedSuggestions.length === 0) {
        setActiveKeyword(null);
      }
    }
  };

  const deleteIPC = (index: number) => {
    setIPCList(ipcList.filter((_, i) => i !== index));
  };

  const deleteKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleKeywordClick = (keyword: string) => {
    // Toggle active state
    if (activeKeyword === keyword) {
      setActiveKeyword(null);
      setSuggestedWords([]);
    } else {
      setActiveKeyword(keyword);
      // Show suggestions for clicked keyword (max 5)
      const suggestions = (keywordSuggestions[keyword] || [])
        .slice(0, 5)
        .filter((word) => !keywords.find((kw) => kw.word === word));
      setSuggestedWords(suggestions);
    }
  };

  const generateFormula = (templateId: string) => {
    const ipcCodes = ipcList.map((ipc) => ipc.code);
    const keywordsList = keywords.map((kw) => kw.word);

    let formula = "";

    switch (templateId) {
      case "ipc-keywords":
        // IncoPat format: IPC/CPC + Keywords in title and abstract
        const ipcPart = ipcCodes.map((code) => `IPC=${code}`).join(" OR ");
        const keywordPart = keywordsList
          .map((kw) => `TI=${kw} OR AB=${kw}`)
          .join(" OR ");
        formula = `(${ipcPart}) AND (${keywordPart})`;
        break;
      case "keywords-only":
        // IncoPat format: Keywords only in title and abstract
        const keywordsOnlyPart = keywordsList
          .map((kw) => `TI=${kw} OR AB=${kw}`)
          .join(" OR ");
        formula = `(${keywordsOnlyPart})`;
        break;
    }

    setGeneratedFormula(formula);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    generateFormula(templateId);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedFormula);
  };

  const toggleIPC = (index: number) => {
    setIPCList(
      ipcList.map((ipc, i) =>
        i === index ? { ...ipc, selected: !ipc.selected } : ipc,
      ),
    );
  };

  const toggleKeyword = (index: number) => {
    setKeywords(
      keywords.map((kw, i) =>
        i === index ? { ...kw, selected: !kw.selected } : kw,
      ),
    );
  };

  // Patent search
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setSearchResults(mockPatents);
      setOriginalSearchResults(mockPatents);
      setIsSearching(false);
    }, 1500);
  };

  // Reset search results
  const handleResetResults = () => {
    setSearchResults([...originalSearchResults]);
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
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                专利检索式生成
              </h2>
              <p className="text-xs text-muted-foreground">{fileName}</p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                step === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary",
              )}
            >
              {step > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <span className="text-sm font-medium text-foreground">
              提取关键信息
            </span>
          </div>
          <div className="mx-2 h-px w-8 bg-border" />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                step === 2
                  ? "bg-primary text-primary-foreground"
                  : step > 2
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {step > 2 ? <Check className="h-4 w-4" /> : "2"}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                step >= 2 ? "text-foreground" : "text-muted-foreground",
              )}
            >
              生成检索式
            </span>
          </div>
          <div className="mx-2 h-px w-8 bg-border" />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                step === 3
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              3
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                step === 3 ? "text-foreground" : "text-muted-foreground",
              )}
            >
              检索相关文件
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-background p-6">
        {step === 1 ? (
          /* Step 1: Extract Information */
          <div className="mx-auto max-w-5xl space-y-6">
            {/* IPC/CPC List */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  IPC/CPC
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {ipcList.map((ipc, index) => (
                    <div
                      key={index}
                      title={ipc.name}
                      className="group relative flex items-center rounded-lg border border-primary bg-primary/10 pr-8 pl-4 py-2 font-mono text-sm font-medium text-primary transition-all"
                    >
                      {ipc.code}
                      {/* Delete button */}
                      <button
                        onClick={() => deleteIPC(index)}
                        className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {/* Tooltip on hover */}
                      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">
                        {ipc.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Search IPC Input Row */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-accent/30 p-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={newIPCCode}
                      onChange={(e) => handleIPCInputChange(e.target.value)}
                      placeholder="搜索 IPC/CPC 分类号"
                      className="flex-1 bg-transparent px-2 py-1 text-sm font-mono outline-none placeholder:text-muted-foreground"
                    />
                  </div>

                  {/* IPC Suggestions */}
                  {filteredIPCSuggestions.length > 0 && (
                    <div className="rounded-lg bg-accent/30 p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        选择分类
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {filteredIPCSuggestions.map((ipc, index) => (
                          <button
                            key={index}
                            onClick={() => addIPC(ipc)}
                            className="group relative flex items-center rounded-lg border border-border bg-background px-4 py-2 font-mono text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                            title={ipc.name}
                          >
                            {ipc.code}
                            {/* Tooltip */}
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">
                              {ipc.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No results message */}
                  {newIPCCode.trim() && filteredIPCSuggestions.length === 0 && (
                    <div className="rounded-lg bg-accent/30 p-3 text-center">
                      <p className="text-sm text-muted-foreground">
                        未找到匹配的分类号
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Tags className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  关键词
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <button
                      key={index}
                      onClick={() => handleKeywordClick(keyword.word)}
                      className={cn(
                        "group relative flex items-center rounded-lg border pr-8 pl-4 py-2 text-sm font-medium transition-all cursor-pointer",
                        activeKeyword === keyword.word
                          ? "border-primary bg-primary/20 text-primary ring-2 ring-primary"
                          : "border-primary bg-primary/10 text-primary hover:bg-primary/15",
                      )}
                    >
                      {keyword.word}
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteKeyword(index);
                          if (activeKeyword === keyword.word) {
                            setActiveKeyword(null);
                            setSuggestedWords([]);
                          }
                        }}
                        className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </button>
                  ))}
                </div>

                {/* Add Keyword Input Row */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-accent/30 p-3">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && addKeyword(newKeyword)
                      }
                      placeholder="输入关键词"
                      className="flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <Button
                      onClick={() => addKeyword(newKeyword)}
                      disabled={!newKeyword.trim()}
                      size="sm"
                      className="h-8"
                    >
                      添加
                    </Button>
                  </div>

                  {/* Suggested Extended Words */}
                  {suggestedWords.length > 0 && (
                    <div className="rounded-lg bg-accent/30 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <p className="text-xs font-medium text-muted-foreground">
                          {activeKeyword
                            ? `"${activeKeyword}" 的扩展词（同类词）`
                            : "推荐的扩展词（同类词）"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestedWords.map((word, index) => (
                          <button
                            key={index}
                            onClick={() => addSuggestedWord(word)}
                            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                          >
                            <Plus className="h-3 w-3" />
                            {word}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : step === 2 ? (
          /* Step 2: Generate Formula */
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Template Selection */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                选择检索式模版
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-all",
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "border-border bg-card hover:bg-accent",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">
                        {template.name}
                      </h4>
                      {selectedTemplate === template.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <div className="rounded bg-accent/50 px-3 py-2">
                      <code className="text-xs text-foreground">
                        {template.example}
                      </code>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Formula */}
            {generatedFormula && (
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    生成的检索式
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="gap-2 bg-transparent"
                  >
                    <Copy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <Textarea
                  value={generatedFormula}
                  onChange={(e) => setGeneratedFormula(e.target.value)}
                  className="min-h-[150px] resize-y font-mono text-sm bg-accent/50 border-border"
                  placeholder="生成的检索式将显示在这里，支持手动编辑"
                />
                <div className="mt-4 rounded-lg bg-primary/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    此检索式已根据您选择的IPC分类、关键词和扩展词自动生成。您可以直接在专利数据库中使用该检索式进行查询。
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Step 3: Search Results */
          <div className="mx-auto max-w-5xl space-y-6">
            {isSearching ? (
              <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">正在检索相关专利文件...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      检索结果 ({searchResults.length})
                    </h3>
                    {searchResults.length < originalSearchResults.length && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetResults}
                        className="h-8 text-xs"
                      >
                        重置筛选
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <PatentSearchResults results={searchResults} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Actions */}
      <footer className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
        <div>
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="gap-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              返回上一步
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {step === 1 ? (
            <Button onClick={() => setStep(2)} className="gap-2">
              下一步：生成检索式
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : step === 2 ? (
            <Button
              onClick={() => {
                setStep(3);
                handleSearch();
              }}
              disabled={!generatedFormula}
              className="gap-2"
            >
              运行检索
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onBack}>完成</Button>
          )}
        </div>
      </footer>
    </div>
  );
}
