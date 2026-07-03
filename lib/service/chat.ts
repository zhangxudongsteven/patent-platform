import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { CallbackHandler } from "@langfuse/langchain";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";

const langfuseHandler = new CallbackHandler();

const MISSING_OPENAI_API_KEY_MESSAGE =
  "当前未配置 OPENAI_API_KEY，无法调用问答模型。请配置环境变量后重试。";

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

function createQAChatModel() {
  return new ChatOpenAI({
    modelName: process.env.OPENAI_CHAT_MODEL,
    temperature: 0.7,
    streaming: true,
    openAIApiKey: process.env.OPENAI_API_KEY,
    configuration: {
      baseURL: process.env.OPENAI_BASE_URL,
    },
  });
}

function formatHistory(
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>,
) {
  return chatHistory
    .map((msg) => `${msg.role === "user" ? "用户" : "助手"}: ${msg.content}`)
    .join("\n");
}

function createQAPromptTemplate() {
  return ChatPromptTemplate.fromMessages([
    ["system", QA_SYSTEM_PROMPT],
    ["system", "对话历史：\n{history}\n\n上下文信息：\n{context}"],
    ["human", "{question}"],
  ]);
}

function getTextFromUIMessage(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function toQARequest(messages: UIMessage[]) {
  const visibleMessages = messages
    .filter(
      (message) => message.role === "user" || message.role === "assistant",
    )
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: getTextFromUIMessage(message),
    }))
    .filter((message) => message.content.trim().length > 0);

  const lastUserIndex = visibleMessages.findLastIndex(
    (message) => message.role === "user",
  );

  if (lastUserIndex === -1) {
    return {
      question: "",
      history: [] as Array<{ role: "user" | "assistant"; content: string }>,
    };
  }

  return {
    question: visibleMessages[lastUserIndex].content,
    history: visibleMessages.slice(0, lastUserIndex),
  };
}

function createStaticMessageResponse(content: string) {
  const textId = "missing-openai-api-key";
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: textId });
      writer.write({ type: "text-delta", id: textId, delta: content });
      writer.write({ type: "text-end", id: textId });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function getTextFromLangChainChunk(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (
        part &&
        typeof part === "object" &&
        "type" in part &&
        part.type === "text" &&
        "text" in part &&
        typeof part.text === "string"
      ) {
        return part.text;
      }

      return "";
    })
    .join("");
}

export async function generateQAAnswer(
  question: string,
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>,
  context?: string,
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return MISSING_OPENAI_API_KEY_MESSAGE;
  }

  const model = createQAChatModel();
  const formattedHistory = formatHistory(chatHistory);
  const promptTemplate = createQAPromptTemplate();

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
  if (!process.env.OPENAI_API_KEY) {
    async function* missingConfigGenerator() {
      yield MISSING_OPENAI_API_KEY_MESSAGE;
    }

    return missingConfigGenerator();
  }

  const model = createQAChatModel();
  const formattedHistory = formatHistory(chatHistory);
  const promptTemplate = createQAPromptTemplate();

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

  // Convert to a plain AsyncGenerator to ensure it can be serialized by Next.js Server Actions
  async function* generator() {
    for await (const chunk of stream) {
      yield chunk;
    }
  }

  return generator();
}

export async function streamQAUIMessageResponse(messages: UIMessage[]) {
  if (!process.env.OPENAI_API_KEY) {
    return createStaticMessageResponse(MISSING_OPENAI_API_KEY_MESSAGE);
  }

  const { question, history } = toQARequest(messages);

  if (!question.trim()) {
    return createStaticMessageResponse("请先输入需要咨询的专利问题。");
  }

  const model = createQAChatModel();
  const promptTemplate = createQAPromptTemplate();
  const formattedHistory = formatHistory(history);
  const chain = RunnableSequence.from([promptTemplate, model]);
  const stream = await chain.stream(
    {
      question,
      history: formattedHistory,
      context: "无特定上下文",
    },
    {
      callbacks: [langfuseHandler],
    },
  );
  const uiMessageStream = createUIMessageStream({
    execute: async ({ writer }) => {
      const textId = "qa-answer";

      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: textId });

      for await (const chunk of stream) {
        const text = getTextFromLangChainChunk(chunk.content);

        if (text) {
          writer.write({ type: "text-delta", id: textId, delta: text });
        }
      }

      writer.write({ type: "text-end", id: textId });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  return createUIMessageStreamResponse({
    stream: uiMessageStream,
  });
}
