"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface IPCItem {
  code: string;
}

interface PatentItem {
  id: string;
  title: string;
  applicant: string;
  publicationNumber: string;
  publicationDate: string;
  relevance: number;
  similarities: string;
  differences: string;
  category: "X" | "Y" | "A";
}

export default function ReportTemplateExportPage() {
  const [proposalName, setProposalName] = useState(() => {
    const date = new Date();
    const dateStr = date
      .toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");
    return `专利检索报告-测试-${dateStr}`;
  });

  const [ipcList, setIPCList] = useState<IPCItem[]>([
    { code: "G06F" },
    { code: "G06N" },
  ]);

  const [generatedFormula, setGeneratedFormula] = useState(
    "(IPC=G06F OR IPC=G06N) AND (TI=人工智能 OR AB=人工智能 OR TI=机器学习 OR AB=机器学习)",
  );
  const [searchResults, setSearchResults] = useState<PatentItem[]>([
    {
      id: "1",
      title: "一种基于深度学习的图像识别方法",
      applicant: "某科技公司",
      publicationNumber: "CN112345678A",
      publicationDate: "2023-05-15",
      relevance: 95,
      similarities: "采用深度学习技术，使用神经网络进行特征提取",
      differences: "未公开具体的网络结构优化方法",
      category: "X",
    },
    {
      id: "2",
      title: "机器学习模型训练系统及方法",
      applicant: "某研究院",
      publicationNumber: "CN112345679A",
      publicationDate: "2023-04-20",
      relevance: 88,
      similarities: "涉及模型训练流程，包含数据预处理步骤",
      differences: "训练算法与本方案有显著差异",
      category: "Y",
    },
    {
      id: "3",
      title: "神经网络优化算法",
      applicant: "某大学",
      publicationNumber: "CN112345680A",
      publicationDate: "2023-03-10",
      relevance: 82,
      similarities: "使用优化算法提升模型性能",
      differences: "应用领域不同，技术路线存在差异",
      category: "A",
    },
  ]);

  const [standardAdaptation, setStandardAdaptation] = useState(false);
  const [vehicleApplication, setVehicleApplication] = useState(false);
  const [usageProspect, setUsageProspect] = useState<"高" | "低" | "无" | "">(
    "高",
  );
  const [authorizationProspect, setAuthorizationProspect] = useState<
    "高" | "中" | "低" | "无" | ""
  >("高");
  const [proposalGrade, setProposalGrade] = useState<"A" | "B" | "C" | "不通过" | "">("A");
  const [conclusion, setConclusion] = useState("根据专利检索分析，本提案技术方案具有较好的创新性和实用性。经过检索发现的相关专利文献中，未发现完全相同的技术方案，现有技术与本提案存在明显差异。该技术方案在相关领域具有较好的应用前景，建议优先推进专利申请工作。");

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const data = {
        proposalName,
        ipcList,
        generatedFormula,
        searchResults,
        standardAdaptation,
        vehicleApplication,
        usageProspect,
        authorizationProspect,
        proposalGrade,
        conclusion,
      };

      const response = await fetch("/api/report/template-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "文档生成失败");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${proposalName}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("文档导出成功");
    } catch (error) {
      console.error("导出失败:", error);
      toast.error(error instanceof Error ? error.message : "文档导出失败");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">
          检索报告模板导出测试
        </h2>
        <Button onClick={handleExport} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "生成中..." : "生成并导出"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Step 1: 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>1. 基本信息</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposalName">提案名称</Label>
              <Input
                id="proposalName"
                placeholder="请输入提案名称"
                value={proposalName}
                onChange={(e) => setProposalName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="searchDate">检索日期</Label>
              <Input
                id="searchDate"
                value={new Date().toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 2: 检索领域 */}
        <Card>
          <CardHeader>
            <CardTitle>2. 检索领域</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label>IPC/CPC 分类号</Label>
              <div className="flex flex-wrap gap-2">
                {ipcList.map((ipc, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-border bg-accent/30 px-3 py-1.5 text-sm font-mono font-semibold"
                  >
                    {ipc.code}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: 检索式 */}
        <Card>
          <CardHeader>
            <CardTitle>3. 检索式</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="generatedFormula">检索式内容</Label>
              <Textarea
                id="generatedFormula"
                placeholder="请输入检索式..."
                className="min-h-[100px] font-mono text-sm"
                value={generatedFormula}
                onChange={(e) => setGeneratedFormula(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 4: 相关文件 */}
        <Card>
          <CardHeader>
            <CardTitle>4. 相关文件（共 {searchResults.length} 件）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full">
                <thead className="bg-accent/50">
                  <tr>
                    <th className="border-b border-border px-4 py-2 text-left text-sm font-semibold">
                      公开号
                    </th>
                    <th className="border-b border-border px-4 py-2 text-left text-sm font-semibold">
                      专利名称
                    </th>
                    <th className="border-b border-border px-4 py-2 text-left text-sm font-semibold">
                      相同点
                    </th>
                    <th className="border-b border-border px-4 py-2 text-left text-sm font-semibold">
                      不同点
                    </th>
                    <th className="border-b border-border px-4 py-2 text-center text-sm font-semibold">
                      判定
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((patent) => (
                    <tr key={patent.id} className="border-b border-border">
                      <td className="px-4 py-2 font-mono text-sm">
                        {patent.publicationNumber}
                      </td>
                      <td className="px-4 py-2 text-sm">{patent.title}</td>
                      <td className="px-4 py-2 text-sm">
                        {patent.similarities}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {patent.differences}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold ${
                            patent.category === "X"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : patent.category === "Y"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {patent.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Step 5: 报告信息 */}
        <Card>
          <CardHeader>
            <CardTitle>5. 报告信息</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageProspect">用途前景</Label>
                <Select
                  value={usageProspect}
                  onValueChange={(value: any) => setUsageProspect(value)}
                >
                  <SelectTrigger id="usageProspect">
                    <SelectValue placeholder="选择用途前景" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="高">高</SelectItem>
                    <SelectItem value="低">低</SelectItem>
                    <SelectItem value="无">无</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorizationProspect">授权前景</Label>
                <Select
                  value={authorizationProspect}
                  onValueChange={(value: any) => setAuthorizationProspect(value)}
                >
                  <SelectTrigger id="authorizationProspect">
                    <SelectValue placeholder="选择授权前景" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="高">高</SelectItem>
                    <SelectItem value="中">中</SelectItem>
                    <SelectItem value="低">低</SelectItem>
                    <SelectItem value="无">无</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposalGrade">提案等级</Label>
              <Select
                value={proposalGrade}
                onValueChange={(value: any) => setProposalGrade(value)}
              >
                <SelectTrigger id="proposalGrade">
                  <SelectValue placeholder="选择提案等级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="不通过">不通过</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conclusion">结论</Label>
              <Textarea
                id="conclusion"
                placeholder="请输入检索结论..."
                className="min-h-[200px]"
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
