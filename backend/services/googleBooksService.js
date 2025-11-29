import axios from 'axios';

/*
═══════════════════════════════════════════════════════════════
GOOGLE BOOKS API SERVICE
═══════════════════════════════════════════════════════════════

Purpose: Fetch book metadata from Google Books API to enrich
         AI-generated recommendations with covers, ratings, and details

Example usage:

// Search for books
const results = await searchBooks('Harry Potter', 5);
console.log(results); // Array of 5 Harry Potter books

// Enrich recommendations from Gemini
const titles = ['The Hunger Games', 'Divergent', 'Maze Runner'];
const enriched = await enrichRecommendations(titles);
console.log(enriched); // Array of 3 books with covers and details

// Get specific book
const book = await getBookDetails('google-books-id-123');
console.log(book); // Single book object
*/

/**
 * Search Google Books API for books matching a query
 *
 * @param {string} query - Search term (e.g., "Harry Potter" or "Suzanne Collins")
 * @param {number} maxResults - Maximum number of results to return (default: 10)
 * @returns {Promise<Array>} Array of formatted book objects with metadata
 *
 * @example
 * const books = await searchBooks('The Hunger Games', 5);
 * // Returns array with up to 5 book objects
 */
async function searchBooks(query, maxResults = 10) {
  try {
    console.log(`🔍 Searching Google Books for: "${query}"`);

    // Build API URL with query parameters
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
      key: apiKey
    });

    const url = `${baseUrl}?${params.toString()}`;

    // Make GET request to Google Books API
    const response = await axios.get(url, {
      timeout: 10000 // 10 second timeout
    });

    // Check if we got any results
    if (!response.data.items || response.data.items.length === 0) {
      console.log(`⚠️  No books found for query: "${query}"`);
      return [];
    }

    // Parse and format each book in the response
    const books = response.data.items.map(item => {
      const volumeInfo = item.volumeInfo || {};

      return {
        googleBooksId: item.id || '',
        title: volumeInfo.title || 'Unknown Title',
        authors: volumeInfo.authors || [],
        description: volumeInfo.description || 'No description available',
        thumbnail: volumeInfo.imageLinks?.thumbnail || '',
        pageCount: volumeInfo.pageCount || 0,
        averageRating: volumeInfo.averageRating || 0,
        ratingsCount: volumeInfo.ratingsCount || 0,
        categories: volumeInfo.categories || [],
        publishedDate: volumeInfo.publishedDate || '',
        previewLink: volumeInfo.previewLink || '',
        infoLink: volumeInfo.infoLink || ''
      };
    });

    console.log(`✅ Found ${books.length} book(s) for "${query}"`);
    return books;

  } catch (error) {
    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Google Books API request timed out');
    } else if (error.response?.status === 401) {
      console.error('❌ Invalid Google Books API key');
    } else if (error.response?.status === 429) {
      console.error('❌ Google Books API rate limit exceeded');
    } else {
      console.error(`❌ Error searching Google Books: ${error.message}`);
    }

    // Never throw - always return empty array
    return [];
  }
}

/**
 * Enrich book titles from AI with full metadata from Google Books
 *
 * @param {string[]} bookTitles - Array of book titles from Gemini AI
 * @returns {Promise<Array>} Array of enriched book objects with covers and details
 *
 * @example
 * const titles = ['The Hunger Games', 'Divergent', 'Percy Jackson'];
 * const enriched = await enrichRecommendations(titles);
 * // Returns array of book objects with covers, ratings, descriptions
 */
async function enrichRecommendations(bookTitles) {
  try {
    console.log(`\n📚 Enriching ${bookTitles.length} book recommendations...`);

    const enrichedBooks = [];

    // Process all book titles in parallel
    const bookPromises = bookTitles.map((title, i) => (async () => {
      try {
        console.log(`\n[${i + 1}/${bookTitles.length}] Searching for: "${title}"`);
        // Search for the book and get best match (top result)
        const results = await searchBooks(title, 1);
        if (results.length > 0) {
          const book = results[0];
          console.log(`   ✅ Found: "${book.title}" by ${book.authors.join(', ')}`);
          return book;
        } else {
          console.log(`   ⚠️  Book not found in Google Books: "${title}"`);
          return null;
        }
      } catch (error) {
        console.error(`   ❌ Error processing "${title}": ${error.message}`);
        return null;
      }
    })());

    const results = await Promise.all(bookPromises);
    for (const book of results) {
      if (book) enrichedBooks.push(book);
    }

    console.log(`\n✨ Successfully enriched ${enrichedBooks.length}/${bookTitles.length} books\n`);
    return enrichedBooks;

  } catch (error) {
    console.error(`❌ Error enriching recommendations: ${error.message}`);
    // Return whatever results we managed to get
    return [];
  }
}

/**
 * Get full details for a specific book by its Google Books ID
 *
 * @param {string} googleBooksId - The Google Books volume ID
 * @returns {Promise<Object|null>} Book object with full details, or null if not found
 *
 * @example
 * const book = await getBookDetails('abc123xyz');
 * // Returns single book object or null
 */
async function getBookDetails(googleBooksId) {
  try {
    console.log(`🔍 Fetching details for Google Books ID: ${googleBooksId}`);

    // Build API URL for specific book
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes/${googleBooksId}?key=${apiKey}`;

    // Make GET request
    const response = await axios.get(url, {
      timeout: 10000 // 10 second timeout
    });

    const item = response.data;
    const volumeInfo = item.volumeInfo || {};

    // Format the book data
    const book = {
      googleBooksId: item.id || '',
      title: volumeInfo.title || 'Unknown Title',
      authors: volumeInfo.authors || [],
      description: volumeInfo.description || 'No description available',
      thumbnail: volumeInfo.imageLinks?.thumbnail || '',
      pageCount: volumeInfo.pageCount || 0,
      averageRating: volumeInfo.averageRating || 0,
      ratingsCount: volumeInfo.ratingsCount || 0,
      categories: volumeInfo.categories || [],
      publishedDate: volumeInfo.publishedDate || '',
      previewLink: volumeInfo.previewLink || '',
      infoLink: volumeInfo.infoLink || ''
    };

    console.log(`✅ Found book: "${book.title}" by ${book.authors.join(', ')}`);
    return book;

  } catch (error) {
    // Handle specific error types
    if (error.response?.status === 404) {
      console.error(`❌ Book not found with ID: ${googleBooksId}`);
    } else if (error.response?.status === 401) {
      console.error('❌ Invalid Google Books API key');
    } else if (error.response?.status === 429) {
      console.error('❌ Google Books API rate limit exceeded');
    } else if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timed out');
    } else {
      console.error(`❌ Error fetching book details: ${error.message}`);
    }

    // Never throw - always return null
    return null;
  }
}

// Export all functions for use in other modules
export { searchBooks, enrichRecommendations, getBookDetails };
