import UserBook from '../models/UserBook.js';
import { getBookRecommendations } from './geminiService.js';
import { enrichRecommendations, searchBooks } from './googleBooksService.js';

/**
 * ═══════════════════════════════════════════════════════════════
 * RECOMMENDATION SERVICE
 * ═══════════════════════════════════════════════════════════════
 *
 * Orchestrates the entire recommendation flow:
 * 1. Get user's books from database
 * 2. Analyze reading patterns (genres, authors, ratings)
 * 3. Build user profile
 * 4. Get AI recommendations from Gemini
 * 5. Enrich with Google Books metadata
 * 6. Return personalized recommendations
 *
 * Fallback: If AI fails, returns genre-based recommendations
 */

/**
 * Get personalized book recommendations for a user
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Recommendations with user profile and source
 *
 * @example
 * const result = await getRecommendationsForUser('user-123');
 * console.log(result.recommendations); // Array of 10 books
 * console.log(result.userProfile); // User's reading profile
 * console.log(result.source); // 'AI-powered' or 'Genre-based'
 */
async function getRecommendationsForUser(userId) {
  console.log(`\n🎯 Starting recommendation generation for user: ${userId}`);

  try {
    // ═══════════════════════════════════════════════════════════
    // STEP 1: Get user's books from database
    // ═══════════════════════════════════════════════════════════
    console.log('📚 Fetching user books from database...');
    const userBooks = await UserBook.getUserBooks(userId);
    console.log(`   Found ${userBooks.length} books in user's library`);

    // ═══════════════════════════════════════════════════════════
    // STEP 2: Check if user has enough books for recommendations
    // ═══════════════════════════════════════════════════════════
    if (userBooks.length < 3) {
      console.log('⚠️  User has fewer than 3 books - cannot generate personalized recommendations');
      return {
        recommendations: [],
        message: 'Add at least 3 books to get personalized recommendations',
        userProfile: {
          totalBooks: userBooks.length
        }
      };
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 3: Analyze reading patterns
    // ═══════════════════════════════════════════════════════════
    console.log('🔍 Analyzing reading patterns...');

    // Count genres across all books
    const genreCounts = {};
    userBooks.forEach(book => {
      if (book.categories && Array.isArray(book.categories)) {
        book.categories.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    // Get top 3 genres sorted by frequency
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    console.log(`   Top genres: ${topGenres.join(', ')}`);

    // Count authors across all books
    const authorCounts = {};
    userBooks.forEach(book => {
      if (book.authors && Array.isArray(book.authors)) {
        book.authors.forEach(author => {
          authorCounts[author] = (authorCounts[author] || 0) + 1;
        });
      }
    });

    // Get favorite authors (authors with more than 1 book)
    const favoriteAuthors = Object.entries(authorCounts)
      .filter(entry => entry[1] > 1)
      .map(entry => entry[0]);

    console.log(`   Favorite authors: ${favoriteAuthors.length > 0 ? favoriteAuthors.join(', ') : 'None yet'}`);

    // Calculate average page count
    const totalPages = userBooks.reduce((sum, book) => sum + (book.page_count || 0), 0);
    const avgPageCount = Math.round(totalPages / userBooks.length);

    // Calculate average rating
    const totalRating = userBooks.reduce((sum, book) => sum + (book.average_rating || 0), 0);
    const avgRating = (totalRating / userBooks.length).toFixed(1);

    console.log(`   Average rating: ${avgRating}/5.0`);
    console.log(`   Average page count: ${avgPageCount} pages`);

    // ═══════════════════════════════════════════════════════════
    // STEP 4: Build user profile for AI
    // ═══════════════════════════════════════════════════════════
    const userProfile = {
      totalBooks: userBooks.length,
      topGenres: topGenres,
      favoriteAuthors: favoriteAuthors,
      recentBooks: userBooks.slice(0, 3).map(b => ({
        title: b.title,
        author: b.authors?.[0] || 'Unknown',
        genre: b.categories?.[0] || 'Unknown'
      })),
      avgPageCount: avgPageCount,
      avgRating: parseFloat(avgRating)
    };

    console.log('\n📊 User Profile Summary:');
    console.log(`   Total Books: ${userProfile.totalBooks}`);
    console.log(`   Top Genres: ${userProfile.topGenres.join(', ') || 'None'}`);
    console.log(`   Favorite Authors: ${userProfile.favoriteAuthors.join(', ') || 'None'}`);
    console.log(`   Recent Books: ${userProfile.recentBooks.map(b => b.title).join(', ')}`);

    // ═══════════════════════════════════════════════════════════
    // STEP 5: Try to get AI-powered recommendations from Gemini
    // ═══════════════════════════════════════════════════════════
    try {
      console.log('\n🤖 Requesting recommendations from Gemini AI...');
      const geminiRecs = await getBookRecommendations(userProfile);

      if (geminiRecs && geminiRecs.length > 0) {
        console.log(`✅ Gemini returned ${geminiRecs.length} recommendations`);
        console.log('   Sample recommendations:');
        geminiRecs.slice(0, 3).forEach((rec, i) => {
          console.log(`   ${i + 1}. "${rec.title}" by ${rec.author}`);
        });

        // ═══════════════════════════════════════════════════════
        // STEP 6: Enrich recommendations with Google Books data
        // ═══════════════════════════════════════════════════════
        console.log('\n📖 Enriching recommendations with Google Books metadata...');
        const bookTitles = geminiRecs.map(rec => rec.title);
        const enriched = await enrichRecommendations(bookTitles);

        console.log(`✅ Successfully enriched ${enriched.length} books with covers and details`);

        // Merge Gemini reasons with Google Books data
        const finalRecommendations = enriched.map((book, index) => ({
          ...book,
          reason: geminiRecs[index]?.reason || 'Recommended based on your reading history',
          genre: geminiRecs[index]?.genre || book.categories?.[0] || 'General'
        }));

        console.log(`\n🎉 Successfully generated ${finalRecommendations.length} AI-powered recommendations!`);

        return {
          recommendations: finalRecommendations,
          userProfile: userProfile,
          source: 'AI-powered'
        };
      } else {
        console.log('⚠️  Gemini returned no recommendations, falling back to genre-based search');
        throw new Error('No recommendations from Gemini');
      }

    } catch (geminiError) {
      // ═══════════════════════════════════════════════════════════
      // STEP 7: Fallback to genre-based recommendations if AI fails
      // ═══════════════════════════════════════════════════════════
      console.log(`\n⚠️  Gemini AI failed: ${geminiError.message}`);
      console.log('🔄 Using fallback: Genre-based recommendations...');

      // Use top genre or default to "bestsellers"
      const fallbackQuery = topGenres.length > 0
        ? `${topGenres[0]} books highly rated`
        : 'bestseller books highly rated';

      console.log(`   Searching Google Books for: "${fallbackQuery}"`);

      const fallbackBooks = await searchBooks(fallbackQuery, 10);

      if (fallbackBooks.length > 0) {
        console.log(`✅ Found ${fallbackBooks.length} fallback recommendations`);

        const fallbackRecommendations = fallbackBooks.map(book => ({
          ...book,
          reason: topGenres.length > 0
            ? `Popular ${topGenres[0]} book that readers love`
            : 'Highly rated book that many readers enjoy',
          genre: book.categories?.[0] || topGenres[0] || 'General'
        }));

        return {
          recommendations: fallbackRecommendations,
          userProfile: userProfile,
          source: 'Genre-based'
        };
      } else {
        console.log('❌ Fallback search also returned no results');
        return {
          recommendations: [],
          message: 'Unable to generate recommendations at this time. Please try again later.',
          userProfile: userProfile,
          source: 'Failed'
        };
      }
    }

  } catch (error) {
    console.error('\n❌ Error in recommendation service:', error.message);
    console.error(error.stack);

    // Return error response instead of throwing
    return {
      recommendations: [],
      message: 'An error occurred while generating recommendations. Please try again later.',
      error: error.message,
      source: 'Error'
    };
  }
}

// Export the function
export { getRecommendationsForUser };
