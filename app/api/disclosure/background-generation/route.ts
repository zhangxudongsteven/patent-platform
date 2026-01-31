import { NextRequest, NextResponse } from "next/server";
import { streamBackground } from "./service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inventionName, technicalField, existingProblems } = body;

    if (!inventionName || !technicalField) {
      return NextResponse.json(
        { error: "发明名称和技术领域是必需的" },
        { status: 400 },
      );
    }

    const stream = await streamBackground({
      inventionName,
      technicalField,
      existingProblems:
        existingProblems || "（未提供具体问题，请根据通用情况分析）",
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
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
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("背景技术生成 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
