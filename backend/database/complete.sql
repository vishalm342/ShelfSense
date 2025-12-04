-- Complete the remaining database setup

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