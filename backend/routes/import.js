import express from 'express';
import multer from 'multer';
import Papa from 'papaparse';
import auth from '../middleware/auth.js';
import Book from '../models/Book.js';

const router = express.Router();

// Configure multer for CSV upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype === 'text/csv' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.toLowerCase().endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

/**
 * Map Goodreads bookshelf status to our database status
 * @param {string} goodreadsShelf - The bookshelf value from Goodreads CSV
 * @returns {string} - Our standardized status value
 */
function mapGoodreadsStatus(goodreadsShelf) {
  if (!goodreadsShelf) return 'want_to_read';

  const shelf = goodreadsShelf.toLowerCase().trim();

  if (shelf.includes('read') && !shelf.includes('to-read') && !shelf.includes('currently')) {
    return 'read';
  } else if (shelf.includes('currently-reading') || shelf.includes('currently reading')) {
    return 'currently_reading';
  } else if (shelf.includes('to-read')) {
    return 'want_to_read';
  }

  return 'want_to_read'; // Default
}

/**
 * POST /api/import/goodreads
 * Upload and import Goodreads CSV file
 */
router.post('/goodreads', auth, upload.single('file'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded. Please select a CSV file to import.'
        }
      });
    }

    // Convert buffer to string
    const csvString = req.file.buffer.toString('utf8');

    // Parse CSV
    const parseResult = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid CSV format. Please ensure you uploaded a valid Goodreads export file.',
          details: parseResult.errors.slice(0, 5) // Show first 5 errors
        }
      });
    }

    const books = parseResult.data;

    if (!books || books.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'The CSV file is empty or contains no valid book data.'
        }
      });
    }

    // Validate required columns
    const requiredColumns = ['Title', 'Author'];
    const firstRow = books[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Missing required columns: ${missingColumns.join(', ')}. Please upload a valid Goodreads CSV file.`
        }
      });
    }

    // Track import statistics
    const stats = {
      total: books.length,
      imported: 0,
      skipped: 0,
      errors: 0
    };

    const errorDetails = [];

    // Process each book
    for (const row of books) {
      try {
        // Extract book data from CSV row
        const title = row['Title']?.trim();
        const author = row['Author']?.trim() || row['Author l-f']?.trim();
        const bookId = row['Book Id']?.trim();
        const isbn = row['ISBN']?.trim()?.replace(/[="]/g, ''); // Remove Excel formatting
        const isbn13 = row['ISBN13']?.trim()?.replace(/[="]/g, '');
        const publisher = row['Publisher']?.trim();
        const pageCount = parseInt(row['Number of Pages']) || null;
        const publishedYear = row['Year Published']?.trim();
        const averageRating = parseFloat(row['Average Rating']) || null;
        const bookshelves = row['Bookshelves']?.trim() || row['Exclusive Shelf']?.trim();

        // Skip if no title
        if (!title) {
          stats.skipped++;
          continue;
        }

        // Map status from Goodreads shelf
        const status = mapGoodreadsStatus(bookshelves);

        // Create unique identifier using Goodreads Book ID
        const googleBooksId = `goodreads-${bookId || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Prepare book data for our database
        const bookData = {
          googleBooksId: googleBooksId,
          title: title,
          subtitle: null,
          authors: author ? [author] : [],
          description: row['My Review']?.trim() || null,
          thumbnailUrl: null,
          coverUrl: null,
          isbn10: isbn && isbn.length === 10 ? isbn : null,
          isbn13: isbn13 && isbn13.length === 13 ? isbn13 : (isbn && isbn.length === 13 ? isbn : null),
          publisher: publisher || null,
          publishedDate: publishedYear || null,
          pageCount: pageCount,
          averageRating: averageRating,
          ratingsCount: null,
          categories: [],
          language: 'en'
        };

        // Add to user's library using existing method
        const result = await Book.addToUserLibrary(req.user.id, bookData, status);

        if (result.isNew) {
          stats.imported++;
        } else {
          stats.skipped++;
        }

      } catch (error) {
        console.error(`Error importing book "${row['Title']}":`, error.message);
        stats.errors++;
        errorDetails.push({
          title: row['Title'],
          error: error.message
        });
      }
    }

    // Return success response with statistics
    return res.status(200).json({
      success: true,
      data: {
        message: 'Import completed successfully',
        stats: {
          total: stats.total,
          imported: stats.imported,
          skipped: stats.skipped,
          errors: stats.errors
        },
        errorDetails: errorDetails.length > 0 ? errorDetails.slice(0, 10) : undefined
      }
    });

  } catch (error) {
    console.error('Import error:', error);

    // Handle multer file size error
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: {
          message: 'File size too large. Maximum file size is 10MB.'
        }
      });
    }

    // Handle multer file type error
    if (error.message === 'Only CSV files are allowed') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid file type. Please upload a CSV file.'
        }
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to import books. Please try again or contact support.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

/**
 * GET /api/import/template
 * Download sample Goodreads CSV template
 */
router.get('/template', (req, res) => {
  try {
    const sampleCSV = `Book Id,Title,Author,ISBN,ISBN13,My Rating,Average Rating,Publisher,Binding,Number of Pages,Year Published,Date Read,Date Added,Bookshelves,My Review
1,The Great Gatsby,F. Scott Fitzgerald,0743273567,9780743273565,5,3.93,Scribner,Paperback,180,2004,2023/05/15,2023/01/10,read,Amazing classic!
2,1984,George Orwell,0451524934,9780451524935,4,4.19,Signet Classic,Paperback,328,1961,2023/07/22,2023/06/01,currently-reading,Thought-provoking
3,To Kill a Mockingbird,Harper Lee,0061120081,9780061120084,5,4.27,Harper Perennial,Paperback,324,2006,,2023/08/01,to-read,`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="goodreads_template.csv"');
    res.status(200).send(sampleCSV);
  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to download template file.'
      }
    });
  }
});

export default router;
