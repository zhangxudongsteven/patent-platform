import pool from '@/lib/db';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    console.log('Host:', process.env.POSTGRES_HOST);
    console.log('Database:', process.env.POSTGRES_DB);
    console.log('User:', process.env.POSTGRES_USER);
    
    const client = await pool.connect();
    console.log('✓ Database connection successful!');
    
    // 检查表是否存在
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'history_data'
      );
    `);
    console.log('✓ Table exists:', tableCheck.rows[0].exists);
    
    // 检查 chat_id 字段是否存在
    const columnCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'history_data'
        AND column_name = 'chat_id'
      );
    `);
    console.log('✓ chat_id column exists:', columnCheck.rows[0].exists);
    
    // 如果 chat_id 字段不存在，添加它
    if (!columnCheck.rows[0].exists) {
      console.log('Adding chat_id column...');
      await client.query(`
        ALTER TABLE history_data ADD COLUMN IF NOT EXISTS chat_id VARCHAR(255) UNIQUE
      `);
      console.log('✓ chat_id column added successfully!');
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_history_data_chat_id ON history_data(chat_id)
      `);
      console.log('✓ Index created successfully!');
    }
    
    client.release();
    console.log('✓ All operations completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Database operation failed:', error);
    process.exit(1);
  }
}

testDatabase();
