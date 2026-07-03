import { streamQAUIMessageResponse } from "@/lib/service/chat";
import { validateUIMessages, type UIMessage } from "ai";
import { z } from "zod";

const chatRequestSchema = z.object({
  messages: z.array(z.unknown()),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "无效的对话请求" }, { status: 400 });
  }

  try {
    const messages = await validateUIMessages<UIMessage>({
      messages: parsed.data.messages,
    });

    return streamQAUIMessageResponse(messages);
  } catch {
    return Response.json({ error: "无效的对话请求" }, { status: 400 });
  }
}
