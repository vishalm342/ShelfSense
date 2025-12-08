import { query, pool } from '../config/database.js';

const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');

    // Check if google_books_id column exists
    const checkColumn = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='books' AND column_name='google_books_id'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('Adding google_books_id column to books table...');
      await query(`
        ALTER TABLE books
        ADD COLUMN google_books_id VARCHAR(255) UNIQUE
      `);
      console.log('✅ Added google_books_id column');
    } else {
      console.log('✅ google_books_id column already exists');
    }

    // Ensure published_date is VARCHAR instead of DATE
    const checkPublishedDate = await query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name='books' AND column_name='published_date'
    `);

    if (checkPublishedDate.rows.length > 0 && checkPublishedDate.rows[0].data_type === 'date') {
      console.log('Converting published_date from DATE to VARCHAR...');
      await query(`
        ALTER TABLE books
        ALTER COLUMN published_date TYPE VARCHAR(50) USING published_date::VARCHAR
      `);
      console.log('✅ Converted published_date to VARCHAR');
    } else {
      console.log('✅ published_date is already VARCHAR');
    }

    // Add index on google_books_id if it doesn't exist
    const checkIndex = await query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename='books' AND indexname='idx_books_google_id'
    `);

    if (checkIndex.rows.length === 0) {
      console.log('Adding index on google_books_id...');
      await query(`
        CREATE INDEX idx_books_google_id ON books(google_books_id)
      `);
      console.log('✅ Added index on google_books_id');
    } else {
      console.log('✅ Index on google_books_id already exists');
    }

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations();
