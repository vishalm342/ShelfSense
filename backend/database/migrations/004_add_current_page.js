import { query, pool } from '../../config/database.js';

/**
 * Migration: Add current_page field to user_libraries table
 * This allows users to track their reading progress within a book
 */
const addCurrentPageField = async () => {
  try {
    console.log('🔄 Running migration: Add current_page to user_libraries...');

    // Check if current_page column already exists
    const checkColumn = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='user_libraries' AND column_name='current_page'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('Adding current_page column to user_libraries table...');

      await query(`
        ALTER TABLE user_libraries
        ADD COLUMN current_page INTEGER DEFAULT 0 CHECK (current_page >= 0)
      `);

      console.log('✅ Added current_page column successfully');
    } else {
      console.log('✅ current_page column already exists');
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

addCurrentPageField();
