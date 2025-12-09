import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from '../config/database.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup endpoint - should be disabled in production after first use
router.post('/initialize-database', async (req, res) => {
  try {
    // Security check - only allow if a secret key is provided
    const setupKey = req.headers['x-setup-key'];
    if (setupKey !== process.env.SETUP_SECRET_KEY) {
      return res.status(403).json({
        success: false,
        error: { message: 'Unauthorized - Invalid setup key' }
      });
    }

    console.log('🔄 Starting database initialization...');

    // Read the schema file
    const schemaPath = join(__dirname, '..', 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schema);

    console.log('✅ Database schema initialized successfully!');

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = result.rows.map(row => row.table_name);

    res.status(200).json({
      success: true,
      message: 'Database initialized successfully',
      data: {
        tables: tables,
        count: tables.length
      }
    });

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to initialize database',
        details: error.message
      }
    });
  }
});

// Check database status
router.get('/database-status', async (req, res) => {
  try {
    // Check if tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = result.rows.map(row => row.table_name);
    const requiredTables = ['users', 'books', 'user_libraries', 'reading_sessions', 'recommendations'];
    const missingTables = requiredTables.filter(t => !tables.includes(t));

    res.status(200).json({
      success: true,
      data: {
        initialized: missingTables.length === 0,
        tables: tables,
        missingTables: missingTables,
        totalTables: tables.length
      }
    });

  } catch (error) {
    console.error('❌ Error checking database status:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check database status',
        details: error.message
      }
    });
  }
});

export default router;
