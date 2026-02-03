import { FileText, Search, Type, FileOutput, FileSearch, Tag } from "lucide-react";

export interface TestMenuItem {
  title: string;
  url?: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: TestMenuItem[];
}

export const testConfig: TestMenuItem[] = [
  {
    title: "专利交底书",
    icon: FileText,
    items: [
      {
        title: "交底书模板导出",
        url: "/test/disclosure/template-export",
        icon: FileOutput,
      },
      {
        title: "技术背景生成",
        url: "/test/disclosure/background-generation",
        icon: Type,
      },
    ],
  },
  {
    title: "专利检索式",
    icon: Search,
    items: [
      // 预留位置，暂时为空，或者可以加一个待开发的页面
    ],
  },
  {
    title: "专利检索报告",
    icon: FileSearch,
    items: [
      {
        title: "关键词推荐",
        url: "/test/disclosure/keyword-recommendation",
        icon: Tag,
      },
    ],
  },
];
