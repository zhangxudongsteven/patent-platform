// app/api/disclosure/keyword-recommendation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { recommendKeywords } from './service'; // 导入服务

export async function GET(request: NextRequest) {
  try {
    // 1. 从URL查询参数中获取输入
    const searchParams = request.nextUrl.searchParams;
    const coreKeyword = searchParams.get('keyword');
    const technicalField = searchParams.get('field') || '';
    const desiredCount = Number(searchParams.get('count')) || 5;

    // 2. 验证必要参数
    if (!coreKeyword) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数。请使用格式：/api/disclosure/keyword-recommendation?keyword=智能座舱&field=汽车电子&count=5'
        },
        { status: 400 }
      );
    }

    // 3. 调用服务函数
    const keywordsString = await recommendKeywords({
      coreKeyword,
      technicalField,
      desiredCount,
    });

    // 4. 格式化结果（将顿号分隔的字符串转为数组）
    const recommendations = keywordsString.split('、').filter(item => item.trim());

    // 5. 返回标准成功响应
    return NextResponse.json({
      success: true,
      data: {
        coreKeyword,
        technicalField: technicalField || '通用技术',
        desiredCount,
        recommendations,
        actualCount: recommendations.length,
      },
    });

  } catch (error: any) {
    // 6. 统一错误处理
    console.error('[route] API处理失败：', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器内部错误',
        tip: '请检查：1. .env.local中的DEEPSEEK_API_KEY配置 2. 网络连接 3. DeepSeek服务状态'
      },
      { status: 500 }
    );
  }
}