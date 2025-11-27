import { getRecommendationsForUser } from '../services/recommendationService.js';

/**
 * ═══════════════════════════════════════════════════════════════
 * RECOMMENDATIONS CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 *
 * Handles HTTP requests for book recommendations
 */

/**
 * Get personalized book recommendations for the authenticated user
 *
 * @route   GET /api/recommendations
 * @access  Private (requires authentication)
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware
 * @param {string} req.user.userId - Authenticated user's ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Object} JSON response with recommendations
 *
 * Success Response (200):
 * {
 *   success: true,
 *   data: {
 *     recommendations: [...],
 *     userProfile: {...},
 *     source: 'AI-powered' | 'Genre-based'
 *   }
 * }
 *
 * Not Enough Books Response (200):
 * {
 *   success: true,
 *   data: {
 *     recommendations: [],
 *     message: 'Add at least 3 books to get personalized recommendations',
 *     userProfile: { totalBooks: 2 }
 *   }
 * }
 *
 * Error Response (500):
 * {
 *   success: false,
 *   error: {
 *     message: 'Error generating recommendations'
 *   }
 * }
 */
export async function getRecommendations(req, res, next) {
  try {
    console.log('\n🎯 ═══════════════════════════════════════════════════════════');
    console.log('📥 GET /api/recommendations - Request received');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Get user ID from authenticated request
    const userId = req.user.userId;
    console.log(`👤 User ID: ${userId}`);

    // Validate user ID exists
    if (!userId) {
      console.error('❌ No user ID found in request');
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not authenticated'
        }
      });
    }

    // Call recommendation service to generate recommendations
    console.log('🚀 Calling recommendation service...\n');
    const result = await getRecommendationsForUser(userId);

    // Log results
    console.log('\n📊 Recommendation Service Results:');
    console.log(`   Source: ${result.source}`);
    console.log(`   Recommendations: ${result.recommendations?.length || 0} books`);
    console.log(`   User Profile: ${JSON.stringify(result.userProfile)}`);

    // Check if recommendations were generated
    if (result.recommendations && result.recommendations.length > 0) {
      console.log('\n✅ Successfully generated recommendations');
      console.log('📤 Sending response to client\n');

      return res.status(200).json({
        success: true,
        data: {
          recommendations: result.recommendations,
          userProfile: result.userProfile,
          source: result.source
        }
      });
    } else {
      // User doesn't have enough books or service failed
      console.log('\n⚠️  No recommendations generated');
      console.log(`   Reason: ${result.message || 'Unknown'}`);
      console.log('📤 Sending response to client\n');

      return res.status(200).json({
        success: true,
        data: {
          recommendations: [],
          message: result.message || 'Unable to generate recommendations at this time',
          userProfile: result.userProfile || {}
        }
      });
    }

  } catch (error) {
    console.error('\n❌ ═══════════════════════════════════════════════════════════');
    console.error('❌ Error in recommendations controller:');
    console.error('❌ ═══════════════════════════════════════════════════════════');
    console.error(error);
    console.error('═══════════════════════════════════════════════════════════\n');

    // Pass error to error handling middleware
    next(error);
  }
}

// Export controller functions
export default {
  getRecommendations
};
