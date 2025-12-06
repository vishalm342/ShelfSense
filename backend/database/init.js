import { query } from '../config/database.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing database...');
    
    // Read and execute the schema SQL file
    const schemaPath = join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the entire schema SQL at once to avoid splitting issues with semicolons inside statements
    await query(schemaSql);
    
    console.log('✅ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export { initializeDatabase };