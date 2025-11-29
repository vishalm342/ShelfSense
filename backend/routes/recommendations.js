import express from 'express';
import { getRecommendations } from '../controllers/recommendationsController.js';
import auth from '../middleware/auth.js';

/**
 * ═══════════════════════════════════════════════════════════════
 * RECOMMENDATIONS ROUTES
 * ═══════════════════════════════════════════════════════════════
 *
 * API endpoints for book recommendations
 */

const router = express.Router();

/**
 * @route   GET /api/recommendations
 * @desc    Get personalized book recommendations for authenticated user
 * @access  Private (requires JWT token)
 *
 * Flow:
 * 1. User must be authenticated (auth middleware)
 * 2. Controller fetches user's library
 * 3. Analyzes reading patterns
 * 4. Calls Gemini AI for recommendations
 * 5. Enriches with Google Books metadata
 * 6. Returns 10 personalized books with reasons
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     recommendations: [
 *       {
 *         googleBooksId: "abc123",
 *         title: "Book Title",
 *         authors: ["Author Name"],
 *         description: "...",
 *         thumbnail: "https://...",
 *         pageCount: 320,
 *         averageRating: 4.5,
 *         categories: ["Fantasy"],
 *         reason: "Why this book matches your taste",
 *         genre: "Fantasy"
 *       },
 *       // ... 9 more books
 *     ],
 *     userProfile: {
 *       totalBooks: 15,
 *       topGenres: ["Fantasy", "Sci-Fi"],
 *       favoriteAuthors: ["Author 1", "Author 2"],
 *       avgRating: 4.2
 *     },
 *     source: "AI-powered" // or "Genre-based"
 *   }
 * }
 */
router.get('/', auth, getRecommendations);

export default router;
