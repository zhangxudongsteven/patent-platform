import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

const KEYWORDS_EXPLANATION_TEMPLATE_STRING = `你是一位专业的专利代理师，请根据以下提供的技术方案，提取其中的关键技术术语，并给出通俗易懂的解释，以便于专利审查员或公众理解。

输入技术方案：
{techSolution}

撰写要求：
1. **提取关键词**：识别出方案中的核心技术术语、专业词汇或缩写（如SEI膜、FEC等）。
2. **解释**：对每个术语进行简洁明了的解释。解释应准确，并结合上下文（如果可能）。
3. **格式**：请输出合法的 JSON 格式。
   - 返回一个对象，包含一个 "keywords" 数组。
   - 每个数组元素是一个对象，包含 "term"（术语名称）和 "explanation"（解释内容）两个字段。
   - 示例：
     {{
       "keywords": [
         {{
           "term": "SEI膜",
           "explanation": "固体电解质界面膜，是锂离子电池负极表面形成的一层钝化膜..."
         }}
       ]
     }}
4. **数量**：提取3-10个最关键的术语。

请直接输出 JSON 结果，不要包含 Markdown 代码块标记（如 \`\`\`json），也不要包含开场白。`;

// 创建 prompt 模板
const keywordsPromptTemplate = ChatPromptTemplate.fromTemplate(
  KEYWORDS_EXPLANATION_TEMPLATE_STRING
);

// 创建 OpenAI Compatible 模型实例
const model = new ChatOpenAI({
  modelName: process.env.OPENAI_CHAT_MODEL,
  temperature: 0.1, // 关键词提取需要准确性，降低 temperature
  openAIApiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
  timeout: 120000, // 120s timeout
  maxRetries: 3,
  streaming: true,
});

// 创建字符串输出解析器
const stringOutputParser = new StringOutputParser();

// 创建处理链
const keywordsExplanationChain = RunnableSequence.from([
  keywordsPromptTemplate,
  model,
  stringOutputParser,
]);

/**
 * 流式生成关键词解释
 * @param params 包含技术方案的对象
 * @returns ReadableStream
 */
export async function streamKeywordsExplanation(params: {
  techSolution: string;
}) {
  try {
    console.log("开始执行关键词解释生成 (LangChain)");
    const stream = await keywordsExplanationChain.stream(params);
    return stream;
  } catch (error) {
    console.error("关键词解释生成时发生错误:", error);
    throw new Error("关键词解释生成失败");
  }
}

/**
 * 生成关键词解释
 * @param params 包含技术方案的对象
 * @returns Promise<string> 生成的关键词解释 JSON 字符串
 */
export async function generateKeywordsExplanation(params: {
  techSolution: string;
}): Promise<string> {
  try {
    const result = await keywordsExplanationChain.invoke(params);
    return result;
  } catch (error) {
    console.error("关键词解释生成时发生错误:", error);
    throw new Error("关键词解释生成失败");
  }
}

export { keywordsExplanationChain };
