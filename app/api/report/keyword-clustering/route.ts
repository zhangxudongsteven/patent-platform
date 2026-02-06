import { NextRequest, NextResponse } from "next/server";
import { generateClusters } from "./service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords } = body;

    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: "关键词列表是必需的" },
        { status: 400 },
      );
    }

    if (keywords.length === 0) {
      return NextResponse.json(
        { error: "关键词列表不能为空" },
        { status: 400 },
      );
    }

    // Affinity Propagation 算法不支持流式传输
    // 我们直接等待完整计算结果返回
    const clusters = await generateClusters({
      keywords,
    });

    return NextResponse.json({
      success: true,
      data: {
        keywords,
        actualClusterCount: clusters.length,
        clusters,
      },
    });
  } catch (error) {
    console.error("关键词聚类 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keywordsParam = searchParams.get("keywords");

    if (!keywordsParam) {
      return NextResponse.json(
        {
          error:
            "缺少必要参数。请使用格式：/api/report/keyword-clustering?keywords=机器学习,深度学习,神经网络",
        },
        { status: 400 },
      );
    }

    const keywords = keywordsParam
      .split(/[，、,\n\r]/)
      .map((k) => k.trim())
      .filter((k) => k);

    if (keywords.length === 0) {
      return NextResponse.json(
        { error: "关键词列表不能为空" },
        { status: 400 },
      );
    }

    const clusters = await generateClusters({
      keywords,
    });

    return NextResponse.json({
      success: true,
      data: {
        keywords,
        actualClusterCount: clusters.length,
        clusters,
      },
    });
  } catch (error) {
    console.error("关键词聚类 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
