import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

const KEYWORD_EXTENSION_TEMPLATE = `你是一位资深的专利检索专家。请根据核心关键词生成扩展关联词。

核心关键词：{coreKeywords}

生成要求：
1. 扩展词应涵盖同义词、近义词、上下位概念、技术关联词
2. 扩展词数量限制在5个以内
3. 扩展词必须专业、精准，符合专利数据库的常用术语习惯
4. 输出格式：纯文本，用顿号"、"分隔，不要编号、不要列表符号

请直接输出扩展词，不要有任何其他内容。`;

const KEYWORD_RELATION_TEMPLATE = `你是一位资深的专利检索专家。请分析以下关键词之间的逻辑关系。

关键词列表：{keywords}

分析要求：
1. 判断关键词之间应该使用AND还是OR连接
2. 如果是产品+功能关系（如"蓝牙"和"扭矩扳手"），使用AND
3. 如果是同义词关系（如"人工智能"和"AI"），使用OR
4. 如果是相关但独立的概念，使用OR
5. 输出格式：JSON数组，每个元素包含keywords数组（关键词列表）和operator（AND或OR）

请直接输出JSON，不要有任何其他内容。`;

const IPC_RECOMMENDATION_TEMPLATE = `你是一位资深的专利检索专家。请根据技术主题推荐相关的IPC/CPC分类号。

技术主题：{technicalTopic}

IPC/CPC分类体系：
- A部：人类生活需要（农业、食品、健康、娱乐）
- B部：作业；运输（分离、成型、交通运输）
- C部：化学；冶金（化学工业、石油、材料）
- D部：纺织；造纸（纺织、缝纫、造纸）
- E部：固定建筑物（建筑、采矿）
- F部：机械工程；照明；加热；武器；爆破（发动机、泵、工程元件）
- G部：物理（仪器、摄影、核物理、计算）
- H部：电学（基本电气元件、发电、通信）

推荐要求：
1. 推荐3-5个最相关的IPC/CPC分类号
2. 每个分类号需要包含完整的层级（如：G06F 17/30）
3. 简要说明每个分类号与技术的关联性
4. 按相关性从高到低排序
5. 输出格式：JSON数组，每个元素包含code（分类号）和description（说明）

请直接输出JSON，不要有任何其他内容。`;

const FORMULA_GENERATION_TEMPLATE = `你是一位资深的专利检索专家。请根据以下信息按照Incopat标准生成专利检索式。

关键词列表：{keywords}
IPC/CPC分类号：{ipcCodes}

Incopat检索语法说明：
- IPC字段：IPC=(分类号)，多个分类号用OR连接，如 IPC=(A61B OR G06F)
- CPC字段：CPC=(分类号)，多个分类号用OR连接，如 CPC=(A61B OR G06F)
- 标题摘要字段：TIAB=(关键词)，同时检索标题和摘要
- 逻辑运算符：AND、OR、NOT
- 括号：用于分组和明确优先级

要求：
{formatRequirements}

请直接输出检索式，不要包含任何解释或说明。`;

const FORMAT1_REQUIREMENTS = `1. 生成包含关键词和IPC/CPC分类号的检索式
2. 使用标准Incopat检索语法
3. 检索式简洁明了，便于复制使用
4. 使用括号明确运算优先级
5. 结构要求：(TIAB=(关键词)) AND (IPC=(分类号) OR CPC=(分类号))
6. 示例：(TIAB=(蓝牙 AND 扭矩扳手)) AND (IPC=(B OR F OR G OR H) OR CPC=(B OR F OR G OR H))`;

const FORMAT2_REQUIREMENTS = `1. 生成仅包含关键词的检索式，绝对不要包含IPC或CPC分类号
2. 使用标准Incopat检索语法
3. 检索式简洁明了，便于复制使用
4. 使用括号明确运算优先级
5. 使用TIAB字段同时检索标题和摘要
6. 示例：TIAB=(蓝牙 AND 扭矩扳手)
7. 重要：此格式只包含关键词，不包含任何IPC或CPC分类号`;

const keywordExtensionPromptTemplate = ChatPromptTemplate.fromTemplate(KEYWORD_EXTENSION_TEMPLATE);
const keywordRelationPromptTemplate = ChatPromptTemplate.fromTemplate(KEYWORD_RELATION_TEMPLATE);
const ipcRecommendationPromptTemplate = ChatPromptTemplate.fromTemplate(IPC_RECOMMENDATION_TEMPLATE);
const formulaPromptTemplate = ChatPromptTemplate.fromTemplate(FORMULA_GENERATION_TEMPLATE);

const model = new ChatOpenAI({
  modelName: process.env.OPENAI_CHAT_MODEL,
  temperature: 0.1,
  openAIApiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
  timeout: 120000,
  maxRetries: 1,
  streaming: false,
});

const stringOutputParser = new StringOutputParser();

const keywordExtensionChain = RunnableSequence.from([
  keywordExtensionPromptTemplate,
  model,
  stringOutputParser,
]);

const keywordRelationChain = RunnableSequence.from([
  keywordRelationPromptTemplate,
  model,
  stringOutputParser,
]);

const ipcRecommendationChain = RunnableSequence.from([
  ipcRecommendationPromptTemplate,
  model,
  stringOutputParser,
]);

const formulaGenerationChain = RunnableSequence.from([
  formulaPromptTemplate,
  model,
  stringOutputParser,
]);

export async function extendKeywords(coreKeywords: string[]): Promise<string[]> {
  try {
    const keywordsStr = coreKeywords.join("、");
    const result = await keywordExtensionChain.invoke({ coreKeywords: keywordsStr });
    const extendedKeywords = result.split("、").map(k => k.trim()).filter(k => k);
    return extendedKeywords.slice(0, 5);
  } catch (error) {
    console.error("关键词扩展时发生错误:", error);
    throw new Error("关键词扩展失败");
  }
}

export async function analyzeKeywordRelations(
  keywords: string[]
): Promise<Array<{ keywords: string[]; operator: "AND" | "OR" }>> {
  try {
    const keywordsStr = keywords.join("、");
    const result = await keywordRelationChain.invoke({ keywords: keywordsStr });
    const relations = JSON.parse(result);
    return relations;
  } catch (error) {
    console.error("关键词关系分析时发生错误:", error);
    throw new Error("关键词关系分析失败");
  }
}

export async function recommendIPC(technicalTopic: string): Promise<
  Array<{ code: string; description: string }>
> {
  try {
    const result = await ipcRecommendationChain.invoke({ technicalTopic });
    const ipcList = JSON.parse(result);
    return ipcList;
  } catch (error) {
    console.error("IPC推荐时发生错误:", error);
    throw new Error("IPC推荐失败");
  }
}

export async function generateFormula(params: {
  keywords: string[];
  ipcCodes: string[];
  outputFormat: "format1" | "format2";
}): Promise<{
  formula: string;
}> {
  try {
    const { keywords, ipcCodes, outputFormat } = params;

    const keywordsStr = keywords.join("、");
    const ipcCodesStr = ipcCodes.join("、");

    const formatRequirements =
      outputFormat === "format1"
        ? FORMAT1_REQUIREMENTS
        : FORMAT2_REQUIREMENTS;

    const formula = await formulaGenerationChain.invoke({
      keywords: keywordsStr,
      ipcCodes: ipcCodesStr,
      formatRequirements,
    });

    return {
      formula,
    };
  } catch (error) {
    console.error("检索式生成时发生错误:", error);
    throw new Error("检索式生成失败");
  }
}

export async function streamFormula(params: {
  keywords: string[];
  ipcCodes: string[];
  outputFormat: "format1" | "format2";
}) {
  try {
    const { keywords, ipcCodes, outputFormat } = params;

    const keywordsStr = keywords.join("、");
    const ipcCodesStr = ipcCodes.join("、");

    const formatRequirements =
      outputFormat === "format1"
        ? FORMAT1_REQUIREMENTS
        : FORMAT2_REQUIREMENTS;

    const stream = await formulaGenerationChain.stream({
      keywords: keywordsStr,
      ipcCodes: ipcCodesStr,
      formatRequirements,
    });

    return {
      stream,
    };
  } catch (error) {
    console.error("检索式流式生成时发生错误:", error);
    throw new Error("检索式流式生成失败");
  }
}

export {
  keywordExtensionChain,
  keywordRelationChain,
  ipcRecommendationChain,
  formulaGenerationChain,
};
