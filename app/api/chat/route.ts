import { NextRequest, NextResponse } from "next/server";
import { generateQAAnswer, streamQAAnswer } from "./service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔍 DEBUG - Request Body:", JSON.stringify(body, null, 2));
    let {
      question,
      chatHistory = [],
      context,
      stream = false,
      messages,
    } = body;

    // Handle useChat standard format
    if (messages && Array.isArray(messages)) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "user") {
        let extractedQuestion = "";
        // 尝试从 parts 中提取文本内容
        if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
          const textParts = lastMessage.parts
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text);
          extractedQuestion = textParts.join("");
        }

        // 如果 parts 中没有提取到内容，尝试使用 content
        if (!extractedQuestion && lastMessage.content) {
          extractedQuestion = lastMessage.content;
        }

        if (extractedQuestion) {
          question = extractedQuestion;
        }

        // 构建聊天历史（同样需要处理 parts 格式）
        chatHistory = messages.slice(0, -1).map((m: any) => {
          let content = "";
          if (m.parts && Array.isArray(m.parts)) {
            const textParts = m.parts
              .filter((part: any) => part.type === "text")
              .map((part: any) => part.text);
            content = textParts.join("");
          }

          if (!content && m.content) {
            content = m.content;
          }
          return {
            role: m.role,
            content,
          };
        });

        stream = true; // default to stream for useChat
      }
    }

    // 参数验证
    if (!question || typeof question !== "string") {
      return NextResponse.json({
        error: "问题内容不能为空",
        status: 400,
      });
    }
    // 验证对话历史格式
    const validHistory = Array.isArray(chatHistory)
      ? chatHistory.filter(
          (msg) =>
            msg &&
            ["user", "assistant"].includes(msg.role) &&
            typeof msg.content === "string",
        )
      : [];
    if (stream === true) {
      // 流式响应处理（实时显示生成过程）
      const streamResponse = await streamQAAnswer(
        question,
        validHistory,
        context,
      );
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              if (chunk) {
                const textContent =
                  typeof chunk === "string" ? chunk : JSON.stringify(chunk);
                controller.enqueue(encoder.encode(textContent));
              }
            }
            controller.close();
          } catch (e) {
            console.error("Stream processing error:", e);
            controller.error(e);
          }
        },
      });
      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
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
