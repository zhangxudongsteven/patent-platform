import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const migrationPath = path.join(process.cwd(), 'database', 'migrations', '001_create_history_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
