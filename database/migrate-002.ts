import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const migrationPath = path.join(process.cwd(), 'database', 'migrations', '002_add_chat_id.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    console.log('Migration 002 completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration 002 failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
