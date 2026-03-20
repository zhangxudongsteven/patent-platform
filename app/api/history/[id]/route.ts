import { NextRequest, NextResponse } from 'next/server';
import { getHistoryRecordById, updateHistoryRecord, deleteHistoryRecord } from '@/lib/service/history';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getHistoryRecordById(parseInt(id));
    
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
    
    const record = await updateHistoryRecord(parseInt(id), body);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteHistoryRecord(parseInt(id));
    
    if (!success) {
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
      message: 'History record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting history record:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete history record',
      },
      { status: 500 }
    );
  }
}
