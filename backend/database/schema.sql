-- ShelfSense Database Schema
-- This script creates all the necessary tables for the ShelfSense application

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_books_id VARCHAR(255) UNIQUE,
    isbn VARCHAR(20),
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    authors TEXT[], -- Array of author names
    publisher VARCHAR(255),
    published_date VARCHAR(50),
    page_count INTEGER,
    language VARCHAR(10) DEFAULT 'en',
    description TEXT,
    cover_url TEXT,
    thumbnail_url TEXT,
    categories TEXT[], -- Array of categories
    average_rating DECIMAL(3,2),
    ratings_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User libraries (many-to-many relationship between users and books)
CREATE TABLE IF NOT EXISTS user_libraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'want_to_read' CHECK (status IN ('want_to_read', 'currently_reading', 'read')),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_review TEXT,
    notes TEXT,
    date_started DATE,
    date_finished DATE,
    is_favorite BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

-- Reading sessions for tracking reading progress
CREATE TABLE reading_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    pages_read INTEGER NOT NULL,
    session_duration INTEGER, -- in minutes
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User book recommendations
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- 'similar_books', 'author_recommendation', 'genre_based', etc.
    score DECIMAL(5,4), -- Recommendation confidence score (0-1)
    reason TEXT,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Book genres/categories
CREATE TABLE genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for books and genres (many-to-many)
CREATE TABLE book_genres (
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, genre_id)
);

-- User preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    preferred_genres TEXT[], -- Array of preferred genre names
    reading_goal_books_per_year INTEGER,
    reading_goal_pages_per_day INTEGER,
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_books_google_id ON books(google_books_id);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_title ON books USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_books_authors ON books USING gin(authors);
CREATE INDEX IF NOT EXISTS idx_user_libraries_user_id ON user_libraries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_libraries_book_id ON user_libraries(book_id);
CREATE INDEX IF NOT EXISTS idx_user_libraries_status ON user_libraries(status);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id ON reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_date ON reading_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);

-- Trigger function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating 'updated_at' columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_libraries_updated_at BEFORE UPDATE ON user_libraries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default genres
INSERT INTO genres (name, description) VALUES
    ('Fiction', 'Literary works of fiction'),
    ('Non-Fiction', 'Factual books and educational content'),
    ('Mystery', 'Mystery and detective stories'),
    ('Romance', 'Romantic literature'),
    ('Science Fiction', 'Science fiction and futuristic stories'),
    ('Fantasy', 'Fantasy and magical realism'),
    ('Biography', 'Biographical works'),
    ('History', 'Historical books and accounts'),
    ('Self-Help', 'Personal development and self-improvement'),
    ('Business', 'Business and entrepreneurship'),
    ('Technology', 'Technology and programming books'),
    ('Health', 'Health and wellness books'),
    ('Travel', 'Travel guides and memoirs'),
    ('Cooking', 'Cookbooks and culinary arts'),
    ('Art', 'Art and design books');