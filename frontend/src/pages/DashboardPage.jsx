import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Download, BookOpen, Book, BookMarked, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useBookStore from '../store/bookStore';

export default function DashboardPage() {
  const { user, signOut } = useAuthStore();
  const { stats, fetchStats } = useBookStore();
  const navigate = useNavigate();

  // Fetch stats when component mounts
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background-light)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-accent-sage)]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="text-[var(--color-primary)] w-8 h-8" />
              <h1 className="font-display text-2xl font-bold text-[var(--color-text-forest)]">
                ShelfSense
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-[var(--color-text-charcoal)]">Signed in as</p>
                <p className="text-sm font-medium text-[var(--color-text-forest)]">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-charcoal)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold text-[var(--color-text-forest)] mb-2">
            Welcome to ShelfSense!
          </h2>
          <p className="text-[var(--color-text-charcoal)]">
            Start building your perfect library and get personalized recommendations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                <Book className="text-[var(--color-primary)] w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-charcoal)]">Total Books</p>
            </div>
            <p className="text-3xl font-bold text-[var(--color-text-forest)]">{stats.totalBooks}</p>
          </div>

          <div className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookMarked className="text-green-600 w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-charcoal)]">Books Read</p>
            </div>
            <p className="text-3xl font-bold text-[var(--color-text-forest)]">{stats.booksRead}</p>
          </div>

          <div className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="text-blue-600 w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-charcoal)]">
                Currently Reading
              </p>
            </div>
            <p className="text-3xl font-bold text-[var(--color-text-forest)]">{stats.currentlyReading}</p>
          </div>
        </div>

        {/* Empty State - Only show when no books */}
        {stats.totalBooks === 0 && (
          <div className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 p-12 text-center shadow-sm mb-8">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--color-primary)]/10 rounded-full mb-4">
                  <BookOpen className="text-[var(--color-primary)] w-10 h-10" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[var(--color-text-forest)] mb-2">
                  Your library is empty
                </h3>
                <p className="text-[var(--color-text-charcoal)]">
                  Get started by adding books to your collection or scanning your bookshelf
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Get Recommendations */}
          <button
            onClick={() => navigate('/recommendations')}
            className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 p-6 text-left hover:shadow-lg hover:border-[var(--color-primary)]/50 transition group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg group-hover:bg-[var(--color-primary)] transition">
                <Sparkles className="text-[var(--color-primary)] group-hover:text-white w-6 h-6 transition" />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-[var(--color-text-forest)] mb-1">
                  Get Recommendations
                </h4>
                <p className="text-sm text-[var(--color-text-charcoal)]">
                  Discover books based on your reading taste
                </p>
              </div>
            </div>
          </button>

          {/* Search Books */}
          <button
            onClick={() => navigate('/search')}
            className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 p-6 text-left hover:shadow-lg hover:border-[var(--color-primary)]/50 transition group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-500 transition">
                <Search className="text-blue-600 group-hover:text-white w-6 h-6 transition" />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-[var(--color-text-forest)] mb-1">
                  Search Books
                </h4>
                <p className="text-sm text-[var(--color-text-charcoal)]">
                  Manually search and add books to your collection
                </p>
              </div>
            </div>
          </button>

          {/* Import from Goodreads */}
          <button
            onClick={() => navigate('/import')}
            className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 p-6 text-left hover:shadow-lg hover:border-[var(--color-primary)]/50 transition group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-500 transition">
                <Download className="text-green-600 group-hover:text-white w-6 h-6 transition" />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-[var(--color-text-forest)] mb-1">
                  Import from Goodreads
                </h4>
                <p className="text-sm text-[var(--color-text-charcoal)]">
                  Import your existing library from Goodreads
                </p>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
