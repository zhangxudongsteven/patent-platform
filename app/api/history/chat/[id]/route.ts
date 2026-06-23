import { NextRequest, NextResponse } from 'next/server';
import { getHistoryRecordByChatId, updateHistoryRecordByChatId } from '@/lib/service/history';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getHistoryRecordByChatId(id);
    
    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: 'History record not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error fetching history record:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch history record',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const record = await updateHistoryRecordByChatId(id, body);
    
    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: 'History record not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error updating history record:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update history record',
      },
      { status: 500 }
    );
  }
}
