import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('🔄 Starting database initialization...');

    // Read the schema file
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schema);

    console.log('✅ Database schema initialized successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - books');
    console.log('   - user_libraries');
    console.log('   - reading_sessions');
    console.log('   - recommendations');
    console.log('   - genres');
    console.log('   - book_genres');
    console.log('   - user_preferences');

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📋 Existing tables in database:');
    result.rows.forEach(row => console.log(`   - ${row.table_name}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
