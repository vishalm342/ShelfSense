/**
 * Test script for Gemini AI Service
 * Run this to verify the Gemini integration is working correctly
 *
 * Usage: node services/testGemini.js
 */

// Import environment configuration first
import '../config/env.js';

import { getBookRecommendations, testGeminiService } from './geminiService.js';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  GEMINI AI SERVICE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test 1: Simple service test
  console.log('📋 Test 1: Basic Service Functionality\n');
  const serviceWorks = await testGeminiService();

  if (!serviceWorks) {
    console.log('\n❌ Service test failed. Please check your API key and internet connection.');
    process.exit(1);
  }

  console.log('\n───────────────────────────────────────────────────────────\n');

  // Test 2: Comprehensive recommendation test
  console.log('📋 Test 2: Generating Recommendations for Fantasy Reader\n');

  const fantasyProfile = {
    topGenres: ['Fantasy', 'Science Fiction', 'Young Adult'],
    favoriteAuthors: ['J.K. Rowling', 'Rick Riordan', 'Brandon Sanderson'],
    recentBooks: [
      { title: "Harry Potter and the Sorcerer's Stone", author: 'J.K. Rowling', genre: 'Fantasy' },
      { title: 'Percy Jackson & The Lightning Thief', author: 'Rick Riordan', genre: 'Fantasy' },
      { title: 'The Way of Kings', author: 'Brandon Sanderson', genre: 'Fantasy' }
    ],
    totalBooks: 25,
    avgRating: 4.5
  };

  try {
    console.log('User Profile:');
    console.log('  Genres:', fantasyProfile.topGenres.join(', '));
    console.log('  Authors:', fantasyProfile.favoriteAuthors.join(', '));
    console.log('  Total Books:', fantasyProfile.totalBooks);
    console.log('  Avg Rating:', fantasyProfile.avgRating);
    console.log('\nGenerating recommendations...\n');

    const recommendations = await getBookRecommendations(fantasyProfile);

    if (recommendations.length === 0) {
      console.log('⚠️  No recommendations generated. Service may be experiencing issues.');
      process.exit(1);
    }

    console.log(`✅ Successfully generated ${recommendations.length} recommendations:\n`);

    recommendations.forEach((book, index) => {
      console.log(`${index + 1}. "${book.title}" by ${book.author}`);
      console.log(`   Genre: ${book.genre}`);
      console.log(`   Why: ${book.reason}`);
      console.log();
    });

    console.log('───────────────────────────────────────────────────────────\n');

    // Test 3: Different profile (Mystery/Thriller reader)
    console.log('📋 Test 3: Generating Recommendations for Mystery Reader\n');

    const mysteryProfile = {
      topGenres: ['Mystery', 'Thriller', 'Crime'],
      favoriteAuthors: ['Agatha Christie', 'Dan Brown'],
      recentBooks: [
        { title: 'Murder on the Orient Express', author: 'Agatha Christie', genre: 'Mystery' },
        { title: 'The Da Vinci Code', author: 'Dan Brown', genre: 'Thriller' }
      ],
      totalBooks: 18,
      avgRating: 4.2
    };

    console.log('User Profile:');
    console.log('  Genres:', mysteryProfile.topGenres.join(', '));
    console.log('  Authors:', mysteryProfile.favoriteAuthors.join(', '));
    console.log('\nGenerating recommendations...\n');

    const mysteryRecommendations = await getBookRecommendations(mysteryProfile);

    if (mysteryRecommendations.length > 0) {
      console.log(`✅ Successfully generated ${mysteryRecommendations.length} recommendations\n`);

      // Show just first 3 for brevity
      mysteryRecommendations.slice(0, 3).forEach((book, index) => {
        console.log(`${index + 1}. "${book.title}" by ${book.author}`);
        console.log(`   Genre: ${book.genre}`);
        console.log();
      });

      console.log(`... and ${mysteryRecommendations.length - 3} more recommendations\n`);
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ✅ ALL TESTS PASSED');
    console.log('  Gemini AI service is fully operational!');
    console.log('═══════════════════════════════════════════════════════════');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runTests();
