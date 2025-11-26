import express from 'express';
import { body, param, validationResult } from 'express-validator';
import Book from '../models/Book.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Debug route to check API key (remove in production)
router.get('/debug-key', (req, res) => {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  res.json({
    keyPresent: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyPrefix: apiKey?.substring(0, 10) || 'undefined'
  });
});

// @route   GET /api/books/search
// @desc    Search books using Google Books API with API key
// @access  Public (no auth required for searching)
router.get('/search', async (req, res, next) => {
  try {
    const { q: query } = req.query;

    // Validate query parameter
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query is required' }
      });
    }

    // Get API key from environment (read at runtime, not module load time)
    const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

    if (!GOOGLE_BOOKS_API_KEY) {
      console.error('❌ GOOGLE_BOOKS_API_KEY is not set in environment variables');
      return res.status(500).json({
        success: false,
        error: { message: 'Server configuration error: API key not configured' }
      });
    }

    // Build the Google Books API URL with API key
    // Using the API key provides:
    // 1. Higher rate limits (1000 requests/day vs 100/day without key)
    // 2. Better performance and reliability
    // 3. Request tracking in Google Cloud Console
    // 4. Protection against anonymous request throttling
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}`;

    console.log('Fetching from Google Books API (key present:', !!GOOGLE_BOOKS_API_KEY, ')');

    // Fetch from Google Books API with proper headers
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'ShelfSense/1.0',
        'Accept': 'application/json'
      }
    });

    console.log('Google Books API response status:', response.status);
    console.log('Google Books API response ok:', response.ok);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Google Books API error body:', errorBody);
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data = await response.json();

    // Return empty array if no results
    if (!data.items) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Format books for our app (same format as frontend was using)
    const books = data.items.map(item => ({
      googleBooksId: item.id,
      title: item.volumeInfo.title || 'Unknown Title',
      subtitle: item.volumeInfo.subtitle || null,
      authors: item.volumeInfo.authors || ['Unknown Author'],
      description: item.volumeInfo.description || 'No description available',
      categories: item.volumeInfo.categories || [],
      thumbnailUrl: item.volumeInfo.imageLinks?.thumbnail || null,
      coverUrl: item.volumeInfo.imageLinks?.large || item.volumeInfo.imageLinks?.medium || null,
      isbn10: item.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || null,
      isbn13: item.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || null,
      publisher: item.volumeInfo.publisher || null,
      publishedDate: item.volumeInfo.publishedDate || null,
      pageCount: item.volumeInfo.pageCount || null,
      averageRating: item.volumeInfo.averageRating || null,
      ratingsCount: item.volumeInfo.ratingsCount || null,
      language: item.volumeInfo.language || 'en'
    }));

    res.json({
      success: true,
      data: books
    });

  } catch (error) {
    console.error('Error searching Google Books:', error);
    next(error);
  }
});

// Validation middleware for adding a book
const addBookValidation = [
  body('googleBooksId').notEmpty().withMessage('Google Books ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('status')
    .optional()
    .isIn(['want_to_read', 'currently_reading', 'read'])
    .withMessage('Invalid status'),
];

// @route   POST /api/books
// @desc    Add a book to user's library
// @access  Private
router.post('/', auth, addBookValidation, async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const userId = req.user.userId;
    const { status = 'want_to_read', ...bookData } = req.body;

    // Add book to user's library
    const result = await Book.addToUserLibrary(userId, bookData, status);

    res.status(result.isNew ? 201 : 200).json({
      success: true,
      data: {
        book: result.book,
        userBook: result.userBook,
        message: result.isNew
          ? 'Book added to library successfully'
          : 'Book status updated successfully'
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/books
// @desc    Get user's library (optionally filter by status)
// @access  Private
router.get('/', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    // Validate status if provided
    if (status && !['want_to_read', 'currently_reading', 'read'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid status parameter' }
      });
    }

    const library = await Book.getUserLibrary(userId, status);

    // Transform to camelCase for frontend
    const transformedLibrary = library.map(item => ({
      id: item.id,
      userId: item.user_id,
      bookId: item.book_id,
      status: item.status,
      userRating: item.user_rating,
      userReview: item.user_review,
      notes: item.notes,
      dateStarted: item.date_started,
      dateFinished: item.date_finished,
      isFavorite: item.is_favorite,
      addedAt: item.added_at,
      updatedAt: item.updated_at,
      book: {
        id: item.book_id,
        googleBooksId: item.google_books_id,
        title: item.title,
        subtitle: item.subtitle,
        authors: item.authors,
        publisher: item.publisher,
        publishedDate: item.published_date,
        pageCount: item.page_count,
        language: item.language,
        description: item.description,
        coverImageUrl: item.cover_image_url,
        thumbnailUrl: item.thumbnail_url,
        categories: item.categories,
        averageRating: item.average_rating,
        ratingsCount: item.ratings_count,
        isbn: item.isbn
      }
    }));

    res.json({
      success: true,
      data: transformedLibrary
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/books/stats
// @desc    Get user's library statistics
// @access  Private
router.get('/stats', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const stats = await Book.getUserStats(userId);

    // Transform to camelCase and convert strings to numbers
    const transformedStats = {
      totalBooks: parseInt(stats.total_books) || 0,
      booksRead: parseInt(stats.books_read) || 0,
      currentlyReading: parseInt(stats.currently_reading) || 0,
      wantToRead: parseInt(stats.want_to_read) || 0
    };

    res.json({
      success: true,
      data: transformedStats
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/books/check/:googleBooksId
// @desc    Check if book is in user's library
// @access  Private
router.get('/check/:googleBooksId', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { googleBooksId } = req.params;

    const result = await Book.isInUserLibrary(userId, googleBooksId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/books/:bookId/status
// @desc    Update book status in user's library
// @access  Private
router.put(
  '/:bookId/status',
  auth,
  [
    param('bookId').isUUID().withMessage('Invalid book ID'),
    body('status')
      .isIn(['want_to_read', 'currently_reading', 'read'])
      .withMessage('Invalid status')
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }

      const userId = req.user.userId;
      const { bookId } = req.params;
      const { status } = req.body;

      const updatedBook = await Book.updateUserBookStatus(userId, bookId, status);

      res.json({
        success: true,
        data: {
          userBook: updatedBook,
          message: 'Book status updated successfully'
        }
      });

    } catch (error) {
      if (error.message === 'Book not found in user library') {
        return res.status(404).json({
          success: false,
          error: { message: error.message }
        });
      }
      next(error);
    }
  }
);

// @route   DELETE /api/books/:bookId
// @desc    Remove book from user's library
// @access  Private
router.delete(
  '/:bookId',
  auth,
  [param('bookId').isUUID().withMessage('Invalid book ID')],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }

      const userId = req.user.userId;
      const { bookId } = req.params;

      await Book.removeFromUserLibrary(userId, bookId);

      res.json({
        success: true,
        data: { message: 'Book removed from library successfully' }
      });

    } catch (error) {
      if (error.message === 'Book not found in user library') {
        return res.status(404).json({
          success: false,
          error: { message: error.message }
        });
      }
      next(error);
    }
  }
);

export default router;
