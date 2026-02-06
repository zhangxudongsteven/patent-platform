import { NextRequest, NextResponse } from "next/server";
import { generateQAAnswer } from "./service";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      question, 
      chatHistory = [], 
      context,
      stream = false
    } = body;
    // 参数验证
    if (!question || typeof question !== "string") {
      return NextResponse.json({
        error: "问题内容不能为空",
        status: 400,
      });
    }
    // 验证对话历史格式
    const validHistory = Array.isArray(chatHistory) 
      ? chatHistory.filter(msg => 
          msg && 
          ["user", "assistant"].includes(msg.role) && 
          typeof msg.content === "string"
        )
      : [];
    if (stream === true) {
      // 流式响应处理（实时显示生成过程）
      const streamResponse = await generateQAAnswer(
        question,
        validHistory,
        context
      );
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              if (chunk) {
                controller.enqueue(encoder.encode(chunk));
              }
            }
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        },
      });
      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    } else {
      // 普通响应
      const answer = await generateQAAnswer(question, validHistory, context);
      
      return NextResponse.json({
        success: true,
        data: {
          answer,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error("问答API处理错误：", error);
    return NextResponse.json({
      error: "服务器内部错误",
      status: 500,
    });
  }
}
