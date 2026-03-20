import { NextResponse } from 'next/server';
import { getHistoryRecords, createHistoryRecord } from '@/lib/service/history';

export async function GET() {
  try {
    const records = await getHistoryRecords('general');
    return NextResponse.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get records',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const testRecord = {
      chat_id: crypto.randomUUID(),
      operation_title: `测试记录 - ${new Date().toLocaleTimeString()}`,
      operation_type: 'general',
      operation_content: JSON.stringify([
        { role: 'user', content: '测试消息' },
        { role: 'assistant', content: '测试回复' }
      ]),
      operation_result: '测试回复内容',
      folder_id: 'general',
    };

    const record = await createHistoryRecord(testRecord);
    return NextResponse.json({
      success: true,
      data: record,
      message: '测试记录创建成功',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create record',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
