import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import useBookStore from '../store/bookStore';

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [source, setSource] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const { fetchLibrary } = useBookStore();

  const fetchRecommendations = useCallback(async () => {
    console.log('🎯 Fetching recommendations...');
    setLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('❌ No authentication token found in localStorage');
        throw new Error('Please sign in to view recommendations');
      }

      console.log('✅ Token found, making API request...');

      // Use the api service which automatically adds the token
      const response = await api.get('/recommendations');

      console.log('✅ Recommendations response:', response.data);

      if (response.data.success) {
        const { recommendations: recs, userProfile: profile, source: src } = response.data.data;

        setRecommendations(recs || []);
        setUserProfile(profile || null);
        setSource(src || '');

        // Check if there's a message (e.g., not enough books)
        if (response.data.data.message) {
          setMessage(response.data.data.message);
        }
      } else {
        throw new Error(response.data.error?.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      console.error('❌ Error fetching recommendations:', err);

      // Handle authentication errors
      if (err.response?.status === 401) {
        setError('Your session has expired. Please sign in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.error?.message || err.message || 'Failed to load recommendations');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Fetch library and recommendations on mount
  useEffect(() => {
    // Fetch library first so isInLibrary checks work
    fetchLibrary();
    fetchRecommendations();
  }, [fetchLibrary, fetchRecommendations]);

  return (
    <div className="min-h-screen bg-[var(--color-background-light)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-accent-sage)]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-[var(--color-primary)]/10 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--color-text-charcoal)]" />
              </button>
              <Sparkles className="text-[var(--color-primary)] w-8 h-8" />
              <h1 className="font-display text-2xl font-bold text-[var(--color-text-forest)]">
                Book Recommendations
              </h1>
            </div>
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-[var(--color-primary)]/20 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-[var(--color-text-charcoal)] font-medium">
              Analyzing your reading taste...
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-charcoal)]/60">
              This may take a few seconds
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-800 mb-1">Error Loading Recommendations</h3>
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchRecommendations}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not Enough Books State */}
        {!loading && !error && message && recommendations.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 p-12 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--color-primary)]/10 rounded-full mb-4">
                <BookOpen className="text-[var(--color-primary)] w-10 h-10" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[var(--color-text-forest)] mb-2">
                Not Enough Books
              </h3>
              <p className="text-[var(--color-text-charcoal)] mb-6">{message}</p>
              <button
                onClick={() => navigate('/search')}
                className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:bg-[var(--color-primary)]/90 transition"
              >
                Search Books
              </button>
            </div>
          </div>
        )}

        {/* Success State - Show Recommendations */}
        {!loading && !error && recommendations.length > 0 && (
          <>
            {/* User Profile Summary */}
            {userProfile && (
              <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent-sage)]/10 rounded-lg p-6 mb-8 border border-[var(--color-primary)]/20">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-[var(--color-text-forest)] mb-2">
                      Based on Your Reading Profile
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-charcoal)]">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {userProfile.totalBooks} books in library
                      </span>
                      {userProfile.topGenres && userProfile.topGenres.length > 0 && (
                        <span className="flex items-center gap-2">
                          <span className="font-medium">Top genres:</span>
                          <span>{userProfile.topGenres.slice(0, 3).join(', ')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-lg border border-[var(--color-primary)]/30">
                    <span className="text-xs font-medium text-[var(--color-text-charcoal)]">
                      {source === 'AI-powered' ? '🤖 AI-Powered' : '📚 Genre-Based'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Grid */}
            <div className="mb-6">
              <h3 className="font-display text-xl font-bold text-[var(--color-text-forest)] mb-4">
                Recommended for You ({recommendations.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map((book, index) => (
                <RecommendationCard key={book.googleBooksId || index} book={book} />
              ))}
            </div>

            {/* Footer CTA */}
            <div className="mt-12 text-center">
              <p className="text-[var(--color-text-charcoal)] mb-4">
                Want more personalized recommendations?
              </p>
              <button
                onClick={() => navigate('/search')}
                className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:bg-[var(--color-primary)]/90 hover:shadow-lg transition"
              >
                Add More Books to Your Library
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
