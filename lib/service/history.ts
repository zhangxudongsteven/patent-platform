import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface HistoryRecord {
  id?: number;
  chat_id?: string;
  operation_title: string;
  operation_type: string;
  operation_content?: string;
  operation_result?: string;
  folder_id?: string;
  workflow_step?: number;
  created_at?: Date;
  updated_at?: Date;
}

export function generateChatId(): string {
  return uuidv4();
}

export async function createHistoryRecord(record: HistoryRecord): Promise<HistoryRecord> {
  // 如果提供了 chat_id，先检查是否已存在
  if (record.chat_id) {
    const existing = await getHistoryRecordByChatId(record.chat_id);
    if (existing) {
      // 更新现有记录
      return await updateHistoryRecordByChatId(record.chat_id, record) as HistoryRecord;
    }
  }
  
  const query = `
    INSERT INTO history_data (chat_id, operation_title, operation_type, operation_content, operation_result, folder_id, workflow_step)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  
  const values = [
    record.chat_id || null,
    record.operation_title,
    record.operation_type,
    record.operation_content || null,
    record.operation_result || null,
    record.folder_id || 'general',
    record.workflow_step || 0,
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getHistoryRecords(folderId?: string): Promise<HistoryRecord[]> {
  let query = 'SELECT * FROM history_data';
  const params: any[] = [];
  
  if (folderId) {
    query += ' WHERE folder_id = $1';
    params.push(folderId);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result = await pool.query(query, params);
  return result.rows;
}

export async function getHistoryRecordById(id: number): Promise<HistoryRecord | null> {
  const query = 'SELECT * FROM history_data WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

export async function getHistoryRecordByChatId(chatId: string): Promise<HistoryRecord | null> {
  const query = 'SELECT * FROM history_data WHERE chat_id = $1';
  const result = await pool.query(query, [chatId]);
  return result.rows[0] || null;
}

export async function updateHistoryRecord(id: number, record: Partial<HistoryRecord>): Promise<HistoryRecord | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  Object.keys(record).forEach((key) => {
    if (key !== 'id' && record[key as keyof HistoryRecord] !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(record[key as keyof HistoryRecord]);
      paramCount++;
    }
  });
  
  if (fields.length === 0) {
    return getHistoryRecordById(id);
  }
  
  values.push(id);
  const query = `
    UPDATE history_data
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

export async function updateHistoryRecordByChatId(chatId: string, record: Partial<HistoryRecord>): Promise<HistoryRecord | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  Object.keys(record).forEach((key) => {
    if (key !== 'id' && key !== 'chat_id' && record[key as keyof HistoryRecord] !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(record[key as keyof HistoryRecord]);
      paramCount++;
    }
  });
  
  if (fields.length === 0) {
    return getHistoryRecordByChatId(chatId);
  }
  
  values.push(chatId);
  const query = `
    UPDATE history_data
    SET ${fields.join(', ')}
    WHERE chat_id = $${paramCount}
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

export async function deleteHistoryRecord(id: number): Promise<boolean> {
  const query = 'DELETE FROM history_data WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rowCount > 0;
}

export async function searchHistoryRecords(searchTerm: string, folderId?: string): Promise<HistoryRecord[]> {
  let query = 'SELECT * FROM history_data WHERE operation_title ILIKE $1';
  const params: any[] = [`%${searchTerm}%`];
  
  if (folderId) {
    query += ' AND folder_id = $2';
    params.push(folderId);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result = await pool.query(query, params);
  return result.rows;
}
