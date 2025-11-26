import { query, pool } from '../config/database.js';

class Book {
  // Add a new book to the books table or return existing
  static async findOrCreate(bookData) {
    const {
      googleBooksId,
      title,
      subtitle,
      authors,
      description,
      thumbnailUrl,
      coverUrl,
      isbn10,
      isbn13,
      publisher,
      publishedDate,
      pageCount,
      averageRating,
      ratingsCount,
      categories,
      language
    } = bookData;

    // Check if book already exists
    const existingBook = await this.findByGoogleBooksId(googleBooksId);
    if (existingBook) {
      return existingBook;
    }

    // Insert new book
    const sql = `
      INSERT INTO books (
        google_books_id, title, subtitle, authors, publisher, published_date,
        page_count, language, description, cover_image_url, thumbnail_url,
        categories, average_rating, ratings_count, isbn
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    // Use ISBN-13 if available, otherwise ISBN-10
    const isbn = isbn13 || isbn10;

    const values = [
      googleBooksId,
      title,
      subtitle,
      authors || [],
      publisher,
      publishedDate,
      pageCount,
      language || 'en',
      description,
      coverUrl,
      thumbnailUrl,
      categories || [],
      averageRating,
      ratingsCount,
      isbn
    ];

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Find book by Google Books ID
  static async findByGoogleBooksId(googleBooksId) {
    const sql = `
      SELECT * FROM books WHERE google_books_id = $1
    `;
    const result = await query(sql, [googleBooksId]);
    return result.rows[0];
  }

  // Find book by ID
  static async findById(id) {
    const sql = `
      SELECT * FROM books WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Add book to user's library with transaction
  static async addToUserLibrary(userId, bookData, status = 'want_to_read') {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Find or create the book
      const book = await this.findOrCreate(bookData);

      // Check if user already has this book
      const checkSql = `
        SELECT id, status FROM user_libraries
        WHERE user_id = $1 AND book_id = $2
      `;
      const existing = await client.query(checkSql, [userId, book.id]);

      if (existing.rows.length > 0) {
        // Update existing entry
        const updateSql = `
          UPDATE user_libraries
          SET status = $1, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $2 AND book_id = $3
          RETURNING *
        `;
        const result = await client.query(updateSql, [status, userId, book.id]);

        await client.query('COMMIT');
        return { book, userBook: result.rows[0], isNew: false };
      } else {
        // Insert new entry
        const insertSql = `
          INSERT INTO user_libraries (user_id, book_id, status)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        const result = await client.query(insertSql, [userId, book.id, status]);

        await client.query('COMMIT');
        return { book, userBook: result.rows[0], isNew: true };
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user's library with book details
  static async getUserLibrary(userId, status = null) {
    let sql = `
      SELECT
        ul.*,
        b.id as book_id,
        b.google_books_id,
        b.title,
        b.subtitle,
        b.authors,
        b.publisher,
        b.published_date,
        b.page_count,
        b.language,
        b.description,
        b.cover_image_url,
        b.thumbnail_url,
        b.categories,
        b.average_rating,
        b.ratings_count,
        b.isbn
      FROM user_libraries ul
      INNER JOIN books b ON ul.book_id = b.id
      WHERE ul.user_id = $1
    `;

    const values = [userId];

    if (status) {
      sql += ` AND ul.status = $2`;
      values.push(status);
    }

    sql += ` ORDER BY ul.added_at DESC`;

    const result = await query(sql, values);
    return result.rows;
  }

  // Get user's library statistics
  static async getUserStats(userId) {
    const sql = `
      SELECT
        COUNT(*) as total_books,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as books_read,
        COUNT(CASE WHEN status = 'currently_reading' THEN 1 END) as currently_reading,
        COUNT(CASE WHEN status = 'want_to_read' THEN 1 END) as want_to_read
      FROM user_libraries
      WHERE user_id = $1
    `;

    const result = await query(sql, [userId]);
    return result.rows[0];
  }

  // Update book status in user's library
  static async updateUserBookStatus(userId, bookId, status) {
    const sql = `
      UPDATE user_libraries
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND book_id = $3
      RETURNING *
    `;

    const result = await query(sql, [status, userId, bookId]);
    if (result.rows.length === 0) {
      throw new Error('Book not found in user library');
    }
    return result.rows[0];
  }

  // Remove book from user's library
  static async removeFromUserLibrary(userId, bookId) {
    const sql = `
      DELETE FROM user_libraries
      WHERE user_id = $1 AND book_id = $2
      RETURNING *
    `;

    const result = await query(sql, [userId, bookId]);
    if (result.rows.length === 0) {
      throw new Error('Book not found in user library');
    }
    return result.rows[0];
  }

  // Check if book is in user's library
  static async isInUserLibrary(userId, googleBooksId) {
    const sql = `
      SELECT ul.status FROM user_libraries ul
      INNER JOIN books b ON ul.book_id = b.id
      WHERE ul.user_id = $1 AND b.google_books_id = $2
    `;

    const result = await query(sql, [userId, googleBooksId]);
    if (result.rows.length === 0) {
      return { inLibrary: false, status: null };
    }
    return { inLibrary: true, status: result.rows[0].status };
  }
}

export default Book;
