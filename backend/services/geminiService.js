import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini AI Service for Book Recommendations
 *
 * This service uses Google's Gemini AI models to generate personalized book recommendations
 * based on user reading patterns, preferences, and history.
 *
 * Model Strategy:
 * - Primary: gemini-2.0-flash-exp (latest experimental model with enhanced reasoning)
 * - Fallback: gemini-1.5-flash (stable, proven performance)
 *
 * The service automatically falls back to the stable model if the experimental one fails,
 * ensuring reliability while taking advantage of the latest AI capabilities when available.
 */

let genAI = null;
let primaryModel = null;
let fallbackModel = null;

/**
 * Initialize Gemini AI with API key and prepare both models
 *
 * Creates instances of both the primary (experimental) and fallback (stable) models.
 * This allows for seamless fallback without re-initialization.
 *
 * @throws {Error} If GEMINI_API_KEY is not found in environment variables
 * @returns {void}
 *
 * @example
 * initializeGemini();
 * // Models are now ready for use
 */
export function initializeGemini() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);

    // Initialize primary model (latest experimental version)
    // gemini-2.0-flash-exp offers:
    // - Enhanced reasoning capabilities
    // - Better context understanding
    // - Improved creative recommendations
    primaryModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Initialize fallback model (stable version)
    // gemini-1.5-flash-latest offers:
    // - Proven reliability
    // - Consistent performance
    // - Lower latency
    fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    console.log('✅ Gemini AI initialized successfully');
    console.log('   Primary model: gemini-2.0-flash-exp');
    console.log('   Fallback model: gemini-1.5-flash-latest');
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
    throw error;
  }
}

/**
 * Build a detailed prompt for book recommendations
 *
 * Creates a structured prompt that includes user reading profile and specific
 * instructions for the AI to generate personalized recommendations.
 *
 * @param {Object} userProfile - User's reading profile
 * @param {string[]} userProfile.topGenres - User's favorite genres
 * @param {string[]} userProfile.favoriteAuthors - User's favorite authors
 * @param {Array<{title: string, author: string, genre: string}>} userProfile.recentBooks - Recently read books
 * @param {number} userProfile.totalBooks - Total books in user's library
 * @param {number} userProfile.avgRating - Average rating given by user
 * @returns {string} Formatted prompt for Gemini
 * @private
 */
function buildRecommendationPrompt(userProfile) {
  const {
    topGenres = [],
    favoriteAuthors = [],
    recentBooks = [],
    totalBooks = 0,
    avgRating = 0
  } = userProfile;

  const recentBooksText = recentBooks.length > 0
    ? recentBooks.map(book => `  - "${book.title}" by ${book.author} (${book.genre || 'Unknown genre'})`).join('\n')
    : '  - No recent books recorded';

  const genresText = topGenres.length > 0 ? topGenres.join(', ') : 'Various';
  const authorsText = favoriteAuthors.length > 0 ? favoriteAuthors.join(', ') : 'Various';

  return `You are a knowledgeable book recommendation expert. Based on the user's reading profile below, suggest 10 books that they would likely enjoy.

USER READING PROFILE:
- Total Books Read: ${totalBooks}
- Average Rating Given: ${avgRating.toFixed(1)}/5.0
- Favorite Genres: ${genresText}
- Favorite Authors: ${authorsText}

RECENTLY READ BOOKS:
${recentBooksText}

INSTRUCTIONS:
1. Analyze the user's reading patterns, preferred genres, and favorite authors
2. Recommend 10 books that align with their tastes
3. Provide diverse recommendations (mix of popular and hidden gems)
4. Include books from similar genres but also introduce 1-2 books from complementary genres
5. For each recommendation, explain WHY it matches the user's preferences
6. Ensure all recommendations are actual, real books that exist

RESPONSE FORMAT:
Return ONLY a valid JSON array with exactly 10 book recommendations in this format:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "genre": "Primary Genre",
    "reason": "Brief explanation (2-3 sentences) of why this book matches the user's reading profile"
  }
]

IMPORTANT:
- Return ONLY the JSON array, no additional text before or after
- Ensure all books are real and accurately attributed to their authors
- Make sure the JSON is properly formatted and parseable
- Each reason should be personalized based on the user's specific reading history`;
}

/**
 * Parse Gemini response and extract book recommendations
 *
 * Handles various response formats from Gemini, including:
 * - Clean JSON arrays
 * - JSON wrapped in markdown code blocks
 * - JSON with additional text
 *
 * @param {string} responseText - Raw response from Gemini
 * @returns {Array<{title: string, author: string, genre: string, reason: string}>} Parsed recommendations
 * @throws {Error} If response cannot be parsed as valid JSON
 * @private
 */
function parseRecommendationsResponse(responseText) {
  try {
    // Remove markdown code blocks if present
    let cleanedText = responseText.trim();

    // Strip markdown code blocks: ```json\n ... \n``` or ``` ... ```
    // This handles cases where Gemini wraps JSON in markdown
    cleanedText = cleanedText.replace(/```json\n?/g, '');
    cleanedText = cleanedText.replace(/```\n?/g, '');
    cleanedText = cleanedText.trim();

    // Try to find JSON array even if there's extra text
    const jsonArrayMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      cleanedText = jsonArrayMatch[0];
    }

    // Parse the JSON
    const recommendations = JSON.parse(cleanedText);

    // Validate structure
    if (!Array.isArray(recommendations)) {
      throw new Error('Response is not an array');
    }

    // Validate each recommendation has required fields
    const validRecommendations = recommendations.filter(rec =>
      rec.title && rec.author && rec.reason
    );

    if (validRecommendations.length === 0) {
      throw new Error('No valid recommendations found in response');
    }

    return validRecommendations.map(rec => ({
      title: rec.title,
      author: rec.author,
      genre: rec.genre || 'General',
      reason: rec.reason
    }));
  } catch (error) {
    console.error('❌ Failed to parse recommendations response:', error.message);
    console.error('Raw response:', responseText.substring(0, 200) + '...');
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

/**
 * Get personalized book recommendations using Gemini AI
 *
 * This function attempts to generate recommendations using the primary model first,
 * and automatically falls back to the stable model if the primary fails.
 *
 * Fallback Strategy:
 * 1. Try gemini-2.0-flash-exp (experimental, best quality)
 * 2. If fails (rate limit, API error, etc.), try gemini-1.5-flash (stable)
 * 3. If both fail, return empty array and log error
 *
 * @param {Object} userProfile - User's reading profile
 * @param {string[]} userProfile.topGenres - User's favorite genres (e.g., ["Fantasy", "Sci-Fi"])
 * @param {string[]} userProfile.favoriteAuthors - User's favorite authors (e.g., ["J.K. Rowling"])
 * @param {Array<{title: string, author: string, genre: string}>} userProfile.recentBooks - Recently read books
 * @param {number} userProfile.totalBooks - Total number of books read
 * @param {number} userProfile.avgRating - Average rating (1-5)
 * @returns {Promise<Array<{title: string, author: string, genre: string, reason: string}>>} Array of recommendations
 *
 * @example
 * // Example usage:
 * const userProfile = {
 *   topGenres: ["Fantasy", "Science Fiction"],
 *   favoriteAuthors: ["J.K. Rowling", "Rick Riordan"],
 *   recentBooks: [
 *     { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", genre: "Fantasy" },
 *     { title: "Percy Jackson & The Lightning Thief", author: "Rick Riordan", genre: "Fantasy" }
 *   ],
 *   totalBooks: 15,
 *   avgRating: 4.2
 * };
 *
 * const recommendations = await getBookRecommendations(userProfile);
 * console.log(`Got ${recommendations.length} recommendations`);
 * recommendations.forEach(book => {
 *   console.log(`${book.title} by ${book.author}`);
 *   console.log(`Reason: ${book.reason}`);
 * });
 */
export async function getBookRecommendations(userProfile) {
  // Ensure Gemini is initialized
  if (!genAI || !primaryModel || !fallbackModel) {
    console.log('🔄 Initializing Gemini AI...');
    initializeGemini();
  }

  // Build the prompt
  const prompt = buildRecommendationPrompt(userProfile);

  // Try primary model first (gemini-2.0-flash-exp)
  try {
    console.log('🤖 Generating recommendations with gemini-2.0-flash-exp...');

    const result = await primaryModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Successfully generated recommendations with PRIMARY model (gemini-2.0-flash-exp)');

    // Parse and return recommendations
    const recommendations = parseRecommendationsResponse(text);
    console.log(`📚 Generated ${recommendations.length} recommendations`);

    return recommendations;
  } catch (primaryError) {
    console.warn('⚠️  Primary model (gemini-2.0-flash-exp) failed:', primaryError.message);
    console.log('🔄 Falling back to gemini-1.5-flash-latest...');

    // Fallback to stable model (gemini-1.5-flash-latest)
    try {
      const result = await fallbackModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Successfully generated recommendations with FALLBACK model (gemini-1.5-flash-latest)');

      // Parse and return recommendations
      const recommendations = parseRecommendationsResponse(text);
      console.log(`📚 Generated ${recommendations.length} recommendations`);

      return recommendations;
    } catch (fallbackError) {
      console.error('❌ Fallback model (gemini-1.5-flash-latest) also failed:', fallbackError.message);
      console.error('Both models failed. Possible reasons:');
      console.error('  - Rate limit exceeded');
      console.error('  - Invalid API key');
      console.error('  - Network connectivity issues');
      console.error('  - API service temporarily unavailable');

      // Return empty array instead of throwing to allow graceful degradation
      return [];
    }
  }
}

/**
 * Test function to verify Gemini service is working
 *
 * @returns {Promise<boolean>} True if service is working, false otherwise
 *
 * @example
 * const isWorking = await testGeminiService();
 * if (isWorking) {
 *   console.log('Gemini service is operational');
 * }
 */
export async function testGeminiService() {
  try {
    const testProfile = {
      topGenres: ['Fantasy'],
      favoriteAuthors: ['J.R.R. Tolkien'],
      recentBooks: [
        { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy' }
      ],
      totalBooks: 5,
      avgRating: 4.5
    };

    console.log('🧪 Testing Gemini service...');
    const recommendations = await getBookRecommendations(testProfile);

    if (recommendations.length > 0) {
      console.log('✅ Gemini service test PASSED');
      console.log(`   Generated ${recommendations.length} test recommendations`);
      return true;
    } else {
      console.log('⚠️  Gemini service test returned no recommendations');
      return false;
    }
  } catch (error) {
    console.error('❌ Gemini service test FAILED:', error.message);
    return false;
  }
}

/**
 * Get a simple book description or summary using Gemini
 *
 * @param {string} bookTitle - Title of the book
 * @param {string} bookAuthor - Author of the book
 * @returns {Promise<string>} AI-generated description
 *
 * @example
 * const description = await getBookDescription('1984', 'George Orwell');
 * console.log(description);
 */
export async function getBookDescription(bookTitle, bookAuthor) {
  if (!genAI || !primaryModel || !fallbackModel) {
    initializeGemini();
  }

  const prompt = `Provide a compelling 2-3 sentence description of the book "${bookTitle}" by ${bookAuthor}. Focus on what makes it unique and why readers might enjoy it. Be concise and engaging.`;

  try {
    const result = await primaryModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.warn('Primary model failed, using fallback for book description');
    try {
      const result = await fallbackModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (fallbackError) {
      console.error('Failed to generate book description:', fallbackError.message);
      return `${bookTitle} by ${bookAuthor}`;
    }
  }
}

// Export a default object with all functions
export default {
  initializeGemini,
  getBookRecommendations,
  testGeminiService,
  getBookDescription
};
