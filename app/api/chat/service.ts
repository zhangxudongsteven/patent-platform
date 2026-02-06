import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { CallbackHandler } from "@langfuse/langchain";

const langfuseHandler = new CallbackHandler();

const QA_SYSTEM_PROMPT = `你是一个专业的专利工作流程客服助手，专门回答关于专利流程、专利知识、公司内部专利相关制度等问题。
你的角色设定：
1. **专业领域**：专利申报流程、专利制度、技术背景撰写、专利检索等
2. **回复风格**：专业、准确、友好、简洁
3. **知识范围**：
   - 专利申请基本流程
   - 专利交底书撰写规范
   - 专利检索方法
   - 公司内部专利管理制度
   - 技术背景分析要点
回答要求：
1. 以客服身份回答，开头可用"您好，关于专利流程..."
2. 对于不确定的问题，引导用户查询相关资料
3. 保持对话的连贯性，记住之前的对话内容
4. 回答要实用、可操作
请根据用户问题，提供专业、准确的回答。`;

export async function generateQAAnswer(
  question: string,
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>,
  context?: string,
): Promise<string> {
  const model = new ChatOpenAI({
    modelName: process.env.OPENAI_CHAT_MODEL,
    temperature: 0.7,
    streaming: true,
  });

  const formattedHistory = chatHistory
    .map((msg) => `${msg.role === "user" ? "用户" : "助手"}: ${msg.content}`)
    .join("\n");

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", QA_SYSTEM_PROMPT],
    ["system", "对话历史：\n{history}\n\n上下文信息：\n{context}"],
    ["human", "{question}"],
  ]);

  const chain = RunnableSequence.from([
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);

  const response = await chain.invoke(
    {
      question,
      history: formattedHistory,
      context: context || "无特定上下文",
    },
    {
      callbacks: [langfuseHandler],
    },
  );

  return response;
}

export async function streamQAAnswer(
  question: string,
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>,
  context?: string,
) {
  const model = new ChatOpenAI({
    modelName: process.env.OPENAI_CHAT_MODEL,
    temperature: 0.7,
    streaming: true,
  });

  const formattedHistory = chatHistory
    .map((msg) => `${msg.role === "user" ? "用户" : "助手"}: ${msg.content}`)
    .join("\n");

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", QA_SYSTEM_PROMPT],
    ["system", "对话历史：\n{history}\n\n上下文信息：\n{context}"],
    ["human", "{question}"],
  ]);

  const chain = RunnableSequence.from([
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);

  const stream = await chain.stream(
    {
      question,
      history: formattedHistory,
      context: context || "无特定上下文",
    },
    {
      callbacks: [langfuseHandler],
    },
  );

  return stream;
}
