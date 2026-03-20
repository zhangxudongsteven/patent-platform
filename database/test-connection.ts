import pool from '@/lib/db';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Host:', process.env.POSTGRES_HOST);
    console.log('Database:', process.env.POSTGRES_DB);
    console.log('User:', process.env.POSTGRES_USER);
    
    const client = await pool.connect();
    console.log('✓ Database connection successful!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✓ Query successful:', result.rows[0]);
    
    client.release();
    console.log('✓ Test completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
