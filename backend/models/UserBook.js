import { query, pool } from '../config/database.js';

/**
 * UserBook Model
 * Handles user-specific book operations including library management,
 * reading progress tracking, and statistics
 */
class UserBook {
  /**
   * Get all books in a user's library with complete book details
   * @param {string} userId - UUID of the user
   * @param {string|null} status - Optional filter by status ('want_to_read', 'currently_reading', 'read')
   * @returns {Promise<Array>} Array of books with user library details
   */
  static async getUserBooks(userId, status = null) {
    let sql = `
      SELECT
        ul.id as library_id,
        ul.user_id,
        ul.book_id,
        ul.status,
        ul.user_rating,
        ul.user_review,
        ul.notes,
        ul.current_page,
        ul.date_started,
        ul.date_finished,
        ul.is_favorite,
        ul.added_at,
        ul.updated_at,
        b.google_books_id,
        b.isbn,
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
        b.ratings_count
      FROM user_libraries ul
      INNER JOIN books b ON ul.book_id = b.id
      WHERE ul.user_id = $1
    `;

    const values = [userId];

    // Add optional status filter
    if (status) {
      sql += ` AND ul.status = $2`;
      values.push(status);
    }

    sql += ` ORDER BY ul.updated_at DESC, ul.added_at DESC`;

    try {
      const result = await query(sql, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching user books:', error);
      throw error;
    }
  }

  /**
   * Add a book to user's library
   * If book already exists in library, updates the status
   * @param {string} userId - UUID of the user
   * @param {string} bookId - UUID of the book
   * @param {string} status - Reading status ('want_to_read', 'currently_reading', 'read')
   * @returns {Promise<Object>} The created or updated user library entry
   */
  static async addBookToLibrary(userId, bookId, status = 'want_to_read') {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if book already exists in user's library
      const checkSql = `
        SELECT * FROM user_libraries
        WHERE user_id = $1 AND book_id = $2
      `;
      const existing = await client.query(checkSql, [userId, bookId]);

      let result;

      if (existing.rows.length > 0) {
        // Update existing entry
        const updateSql = `
          UPDATE user_libraries
          SET status = $1, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $2 AND book_id = $3
          RETURNING *
        `;
        result = await client.query(updateSql, [status, userId, bookId]);
      } else {
        // Insert new entry
        const insertSql = `
          INSERT INTO user_libraries (user_id, book_id, status)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        result = await client.query(insertSql, [userId, bookId, status]);
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding book to library:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update the reading status of a book in user's library
   * @param {string} userId - UUID of the user
   * @param {string} bookId - UUID of the book
   * @param {string} newStatus - New status ('want_to_read', 'currently_reading', 'read')
   * @returns {Promise<Object>} Updated user library entry
   */
  static async updateBookStatus(userId, bookId, newStatus) {
    const sql = `
      UPDATE user_libraries
      SET
        status = $1,
        date_started = CASE
          WHEN $1 = 'currently_reading' AND date_started IS NULL THEN CURRENT_DATE
          ELSE date_started
        END,
        date_finished = CASE
          WHEN $1 = 'read' AND date_finished IS NULL THEN CURRENT_DATE
          ELSE date_finished
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND book_id = $3
      RETURNING *
    `;

    try {
      const result = await query(sql, [newStatus, userId, bookId]);

      if (result.rows.length === 0) {
        throw new Error('Book not found in user library');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating book status:', error);
      throw error;
    }
  }

  /**
   * Update the current page for a book in user's library
   * Used for tracking reading progress
   * @param {string} userId - UUID of the user
   * @param {string} bookId - UUID of the book
   * @param {number} page - Current page number
   * @returns {Promise<Object>} Updated user library entry
   */
  static async updateCurrentPage(userId, bookId, page) {
    if (page < 0) {
      throw new Error('Page number must be non-negative');
    }

    const sql = `
      UPDATE user_libraries
      SET
        current_page = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND book_id = $3
      RETURNING *
    `;

    try {
      const result = await query(sql, [page, userId, bookId]);

      if (result.rows.length === 0) {
        throw new Error('Book not found in user library');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating current page:', error);
      throw error;
    }
  }

  /**
   * Remove a book from user's library
   * @param {string} userId - UUID of the user
   * @param {string} bookId - UUID of the book
   * @returns {Promise<Object>} Deleted user library entry
   */
  static async removeBook(userId, bookId) {
    const sql = `
      DELETE FROM user_libraries
      WHERE user_id = $1 AND book_id = $2
      RETURNING *
    `;

    try {
      const result = await query(sql, [userId, bookId]);

      if (result.rows.length === 0) {
        throw new Error('Book not found in user library');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error removing book from library:', error);
      throw error;
    }
  }

  /**
   * Get reading statistics for a user
   * Returns counts of books by status and other metrics
   * @param {string} userId - UUID of the user
   * @returns {Promise<Object>} Statistics object with various counts
   */
  static async getReadingStats(userId) {
    const sql = `
      SELECT
        COUNT(*) as total_books,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as books_read,
        COUNT(CASE WHEN status = 'currently_reading' THEN 1 END) as currently_reading,
        COUNT(CASE WHEN status = 'want_to_read' THEN 1 END) as want_to_read,
        COUNT(CASE WHEN is_favorite = true THEN 1 END) as favorites,
        AVG(CASE WHEN user_rating IS NOT NULL THEN user_rating END) as average_user_rating,
        SUM(CASE WHEN status = 'read' AND b.page_count IS NOT NULL THEN b.page_count ELSE 0 END) as total_pages_read
      FROM user_libraries ul
      LEFT JOIN books b ON ul.book_id = b.id
      WHERE ul.user_id = $1
    `;

    try {
      const result = await query(sql, [userId]);
      const stats = result.rows[0];

      // Convert string counts to integers and format average rating
      return {
        totalBooks: parseInt(stats.total_books) || 0,
        booksRead: parseInt(stats.books_read) || 0,
        currentlyReading: parseInt(stats.currently_reading) || 0,
        wantToRead: parseInt(stats.want_to_read) || 0,
        favorites: parseInt(stats.favorites) || 0,
        averageUserRating: stats.average_user_rating ? parseFloat(stats.average_user_rating).toFixed(2) : null,
        totalPagesRead: parseInt(stats.total_pages_read) || 0
      };
    } catch (error) {
      console.error('Error fetching reading stats:', error);
      throw error;
    }
  }

  /**
   * Update user's rating and review for a book
   * @param {string} userId - UUID of the user
   * @param {string} bookId - UUID of the book
   * @param {number|null} rating - Rating from 1-5 (or null to remove rating)
   * @param {string|null} review - Text review (or null)
   * @returns {Promise<Object>} Updated user library entry
   */
  static async updateRatingAndReview(userId, bookId, rating = null, review = null) {
    if (rating !== null && (rating < 1 || rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const sql = `
      UPDATE user_libraries
      SET
        user_rating = $1,
        user_review = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3 AND book_id = $4
      RETURNING *
    `;

    try {
      const result = await query(sql, [rating, review, userId, bookId]);

      if (result.rows.length === 0) {
        throw new Error('Book not found in user library');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating rating and review:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status for a book
   * @param {string} userId - UUID of the user
   * @param {string} bookId - UUID of the book
   * @returns {Promise<Object>} Updated user library entry with new favorite status
   */
  static async toggleFavorite(userId, bookId) {
    const sql = `
      UPDATE user_libraries
      SET
        is_favorite = NOT is_favorite,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND book_id = $2
      RETURNING *
    `;

    try {
      const result = await query(sql, [userId, bookId]);

      if (result.rows.length === 0) {
        throw new Error('Book not found in user library');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Add or update notes for a book
   * @param {string} userId - UUID of the user
   * @param {string} bookId - UUID of the book
   * @param {string} notes - User's notes about the book
   * @returns {Promise<Object>} Updated user library entry
   */
  static async updateNotes(userId, bookId, notes) {
    const sql = `
      UPDATE user_libraries
      SET
        notes = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND book_id = $3
      RETURNING *
    `;

    try {
      const result = await query(sql, [notes, userId, bookId]);

      if (result.rows.length === 0) {
        throw new Error('Book not found in user library');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  }

  /**
   * Check if a book exists in user's library
   * @param {string} userId - UUID of the user
   * @param {string} bookId - UUID of the book
   * @returns {Promise<Object>} Object with inLibrary boolean and status if exists
   */
  static async isInLibrary(userId, bookId) {
    const sql = `
      SELECT status, current_page, is_favorite
      FROM user_libraries
      WHERE user_id = $1 AND book_id = $2
    `;

    try {
      const result = await query(sql, [userId, bookId]);

      if (result.rows.length === 0) {
        return { inLibrary: false, status: null };
      }

      return {
        inLibrary: true,
        status: result.rows[0].status,
        currentPage: result.rows[0].current_page,
        isFavorite: result.rows[0].is_favorite
      };
    } catch (error) {
      console.error('Error checking if book is in library:', error);
      throw error;
    }
  }

  /**
   * Get all favorite books for a user
   * @param {string} userId - UUID of the user
   * @returns {Promise<Array>} Array of favorite books
   */
  static async getFavorites(userId) {
    const sql = `
      SELECT
        ul.*,
        b.title,
        b.subtitle,
        b.authors,
        b.cover_image_url,
        b.thumbnail_url,
        b.page_count,
        b.average_rating
      FROM user_libraries ul
      INNER JOIN books b ON ul.book_id = b.id
      WHERE ul.user_id = $1 AND ul.is_favorite = true
      ORDER BY ul.updated_at DESC
    `;

    try {
      const result = await query(sql, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  /**
   * Get reading progress percentage for a book
   * @param {string} userId - UUID of the user
   * @param {string} bookId - UUID of the book
   * @returns {Promise<Object>} Object with progress information
   */
  static async getReadingProgress(userId, bookId) {
    const sql = `
      SELECT
        ul.current_page,
        b.page_count,
        CASE
          WHEN b.page_count > 0 THEN ROUND((ul.current_page::DECIMAL / b.page_count) * 100, 2)
          ELSE 0
        END as progress_percentage
      FROM user_libraries ul
      INNER JOIN books b ON ul.book_id = b.id
      WHERE ul.user_id = $1 AND ul.book_id = $2
    `;

    try {
      const result = await query(sql, [userId, bookId]);

      if (result.rows.length === 0) {
        throw new Error('Book not found in user library');
      }

      return {
        currentPage: result.rows[0].current_page || 0,
        totalPages: result.rows[0].page_count || 0,
        progressPercentage: parseFloat(result.rows[0].progress_percentage) || 0
      };
    } catch (error) {
      console.error('Error fetching reading progress:', error);
      throw error;
    }
  }
}

export default UserBook;
