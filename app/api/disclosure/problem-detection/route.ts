import { NextRequest, NextResponse } from "next/server";
import { streamProblemDetection } from "./service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { technicalSolution } = body;

    if (!technicalSolution) {
      return NextResponse.json(
        { error: "技术方案是必需的" },
        { status: 400 },
      );
    }

    const stream = await streamProblemDetection({
      technicalSolution,
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
    console.error("技术方案问题检测 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
