import { streamQAUIMessageResponse } from "@/lib/service/chat";
import { type UIMessage } from "ai";
import { z } from "zod";

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["system", "user", "assistant"]),
  parts: z.array(textPartSchema).default([]),
});

const chatRequestSchema = z.object({
  messages: z.array(uiMessageSchema),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "无效的对话请求" }, { status: 400 });
  }

  return streamQAUIMessageResponse(parsed.data.messages as UIMessage[]);
}
