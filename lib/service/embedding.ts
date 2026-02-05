"use server";

import { OpenAIEmbeddings } from "@langchain/openai";
import { CallbackHandler } from "@langfuse/langchain";
import { RunnableLambda } from "@langchain/core/runnables";

const langfuseHandler = new CallbackHandler();

/**
 * 创建 OpenAI Compatible Embedding 模型实例
 */
const embeddings = new OpenAIEmbeddings({
  modelName: process.env.OPENAI_EMBEDDING_MODEL,
  openAIApiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

/**
 * 获取文本的 Embedding 向量
 * @param text 输入文本
 * @returns Promise<number[]> Embedding 向量
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    return await RunnableLambda.from((t: string) =>
      embeddings.embedQuery(t),
    ).invoke(text, { callbacks: [langfuseHandler] });
  } catch (error) {
    console.error("Embedding generation failed:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * 批量获取文本的 Embedding 向量
 * @param texts 输入文本数组
 * @returns Promise<number[][]> Embedding 向量数组
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    return await RunnableLambda.from((t: string[]) =>
      embeddings.embedDocuments(t),
    ).invoke(texts, { callbacks: [langfuseHandler] });
  } catch (error) {
    console.error("Batch embedding generation failed:", error);
    throw new Error("Failed to generate embeddings");
  }
}
