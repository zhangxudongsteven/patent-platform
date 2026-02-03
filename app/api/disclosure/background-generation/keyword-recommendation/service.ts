// app/api/disclosure/keyword-recommendation/service.ts
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

// 1. 定义【专利关键词推荐】的提示词模板
const KEYWORD_RECOMMENDATION_TEMPLATE = `你是一位资深的专利审查员。请根据用户提供的核心专利关键词，生成用于专利检索或技术分析的扩展关联词。

核心关键词：{coreKeyword}
技术领域：{technicalField}
期望数量：{desiredCount}个

请严格按以下要求生成：
1. **关联维度**：需包含技术同义词、上下位概念、技术流程关联词及应用场景词。
2. **输出格式**：必须是纯文本，用中文顿号“、”分隔，不要编号、不要列表、不要任何额外解释。
   正确示例：“机器学习、深度学习、神经网络、图像识别、算法优化”
3. **专业规范**：术语需精准，符合专利数据库常用习惯。

请直接输出关联词：`;

// 创建提示词模板
const keywordPromptTemplate = ChatPromptTemplate.fromTemplate(
  KEYWORD_RECOMMENDATION_TEMPLATE
);

// 2. 创建模型实例（使用你 .env.local 中已配置好的 DeepSeek 变量）
const createModel = () => new ChatOpenAI({
  modelName: process.env.OPENAI_CHAT_MODEL || "deepseek-chat", // 读取你已配置的模型
  temperature: 0.1,
  openAIApiKey: process.env.OPENAI_API_KEY, // 关键：读取 OPENAI_API_KEY
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL, // 关键：读取 OPENAI_BASE_URL
  },
  timeout: 60000,
  maxRetries: 2,
});

// 3. 创建处理链
const createKeywordChain = () => {
  const model = createModel();
  return RunnableSequence.from([
    keywordPromptTemplate,
    model,
    new StringOutputParser(),
  ]);
};

/**
 * 推荐专利关键词关联词
 * @param params 参数对象
 * @returns 关联词字符串（顿号分隔）
 */
export async function recommendKeywords(params: {
  coreKeyword: string;
  technicalField?: string;
  desiredCount?: number;
}): Promise<string> {
  try {
    const chain = createKeywordChain();
    const result = await chain.invoke({
      coreKeyword: params.coreKeyword,
      technicalField: params.technicalField || "通用技术",
      desiredCount: params.desiredCount || 5,
    });
    return result.trim();
  } catch (error) {
    console.error("[service] 关键词推荐失败：", error);
    throw new Error("关键词推荐服务调用失败");
  }
}