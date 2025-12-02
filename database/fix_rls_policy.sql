-- Fix Row Level Security (RLS) Policy for Books Table
-- This allows authenticated users to insert books when adding to their library

-- Drop the old restrictive policy if it exists
DROP POLICY IF EXISTS "Authenticated users can insert books" ON books;

-- Create a new policy that allows inserts when adding to library
CREATE POLICY "Users can insert books when adding to library"
  ON books
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the update policy exists
DROP POLICY IF EXISTS "Authenticated users can update books" ON books;
CREATE POLICY "Authenticated users can update books"
  ON books
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure the select policy exists (users need to read books)
DROP POLICY IF EXISTS "Anyone can view books" ON books;
CREATE POLICY "Anyone can view books"
  ON books
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix user_libraries policies
DROP POLICY IF EXISTS "Users can view own library" ON user_libraries;
CREATE POLICY "Users can view own library"
  ON user_libraries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert into own library" ON user_libraries;
CREATE POLICY "Users can insert into own library"
  ON user_libraries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own library" ON user_libraries;
CREATE POLICY "Users can update own library"
  ON user_libraries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from own library" ON user_libraries;
CREATE POLICY "Users can delete from own library"
  ON user_libraries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
