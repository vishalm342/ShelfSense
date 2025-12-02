-- Migration: Add Google Books API support
-- This adds the necessary fields for Google Books integration

-- Add google_books_id to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS google_books_id TEXT UNIQUE;

-- Add isbn_10 and isbn_13 separately (Google Books returns both)
ALTER TABLE books ADD COLUMN IF NOT EXISTS isbn_10 VARCHAR(20);
ALTER TABLE books ADD COLUMN IF NOT EXISTS isbn_13 VARCHAR(20);

-- Rename cover_image_url to cover_url for consistency
ALTER TABLE books RENAME COLUMN cover_image_url TO cover_url;

-- Add source field to user_libraries to track where the book was added from
ALTER TABLE user_libraries ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';

-- Add date_added to user_libraries
ALTER TABLE user_libraries ADD COLUMN IF NOT EXISTS date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create index on google_books_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_books_google_books_id ON books(google_books_id);

-- Rename user_libraries to user_library for consistency
-- Note: This will require updating all references in the application
-- For now, we'll keep user_libraries but ensure our code uses it correctly
