import { NextRequest, NextResponse } from 'next/server';
import { createHistoryRecord, getHistoryRecords, searchHistoryRecords } from '@/lib/service/history';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folderId') || undefined;
    const searchTerm = searchParams.get('search') || undefined;
    
    let records;
    if (searchTerm) {
      records = await searchHistoryRecords(searchTerm, folderId);
    } else {
      records = await getHistoryRecords(folderId);
    }
    
    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error('Error fetching history records:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch history records',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const record = await createHistoryRecord(body);
    
    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error creating history record:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create history record',
      },
      { status: 500 }
    );
  }
}
