import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the connection string provided earlier
const connectionString = process.env.POSTGRES_URL || "postgres://postgres.llvprbmrnjvamjzavmhg:ajHpUwTyrLVYrqeG@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x";

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false } // Required for Supabase connection
});

async function run() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    
    console.log('📄 Reading schema update script...');
    const sqlPath = path.join(__dirname, '../update-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🚀 Applying schema updates...');
    // Split by semicolon to run statements individually if needed, but client.query usually handles it.
    // For safety with multiple statements, simple query is often fine in pg.
    await client.query(sql);
    
    console.log('✅ Schema updated successfully!');
  } catch (err) {
    console.error('❌ Error updating schema:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();