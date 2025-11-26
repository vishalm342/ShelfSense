import { query } from '../config/database.js';

class User {
  static async create(userData) {
    const { email, password_hash, first_name, last_name } = userData;
    
    const sql = `
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name, is_active, email_verified, created_at, updated_at
    `;
    
    const result = await query(sql, [email, password_hash, first_name, last_name]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const sql = `
      SELECT id, email, password_hash, first_name, last_name, avatar_url, 
             is_active, email_verified, created_at, updated_at
      FROM users 
      WHERE email = $1 AND is_active = TRUE
    `;
    
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT id, email, first_name, last_name, avatar_url, 
             is_active, email_verified, created_at, updated_at
      FROM users 
      WHERE id = $1 AND is_active = TRUE
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async updateProfile(id, updates) {
    const allowedFields = ['first_name', 'last_name', 'avatar_url'];
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const sql = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex} AND is_active = TRUE
      RETURNING id, email, first_name, last_name, avatar_url, 
                is_active, email_verified, created_at, updated_at
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  static async updatePassword(id, newPasswordHash) {
    const sql = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = TRUE
      RETURNING id, email, first_name, last_name, updated_at
    `;

    const result = await query(sql, [newPasswordHash, id]);
    return result.rows[0];
  }

  static async verifyEmail(id) {
    const sql = `
      UPDATE users 
      SET email_verified = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = TRUE
      RETURNING id, email, email_verified, updated_at
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async deactivate(id) {
    const sql = `
      UPDATE users 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, is_active, updated_at
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async getLibraryStats(userId) {
    const sql = `
      SELECT 
        COUNT(*) as total_books,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as books_read,
        COUNT(CASE WHEN status = 'currently_reading' THEN 1 END) as currently_reading,
        COUNT(CASE WHEN status = 'want_to_read' THEN 1 END) as want_to_read,
        COUNT(CASE WHEN is_favorite = TRUE THEN 1 END) as favorites
      FROM user_libraries 
      WHERE user_id = $1
    `;

    const result = await query(sql, [userId]);
    return result.rows[0];
  }
}

export default User;