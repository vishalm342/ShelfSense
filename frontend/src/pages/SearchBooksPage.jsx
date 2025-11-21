import { useState, useEffect } from 'react'
import { Search, Loader } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import BookCard from '../components/common/BookCard'
import { searchBooks, addBookToLibrary, getUserLibrary } from '../services/booksService'
import useAuthStore from '../store/authStore'

export default function SearchBooksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [userLibraryIds, setUserLibraryIds] = useState(new Set())

  const { user } = useAuthStore()

  // Load user's library to check which books they already have
  useEffect(() => {
    loadUserLibrary()
  }, [])

  const loadUserLibrary = async () => {
    const result = await getUserLibrary(user.id)
    if (result.success) {
      const bookIds = new Set(
        result.data.map(item => item.books.google_books_id)
      )
      setUserLibraryIds(bookIds)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)
    setHasSearched(true)

    try {
      const results = await searchBooks(searchQuery)
      setSearchResults(results)
    } catch (err) {
      setError('Failed to search books. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddBook = async (book, status) => {
    const result = await addBookToLibrary(book, user.id, status)

    if (result.success) {
      const statusLabel = {
        'want_to_read': 'Want to Read',
        'currently_reading': 'Currently Reading',
        'read': 'Already Read'
      }[status]

      setSuccessMessage(`✅ "${book.title}" added to ${statusLabel}!`)
      setUserLibraryIds(prev => new Set([...prev, book.googleBooksId]))

      // Auto-hide after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      setError(result.error)
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F4F1DE] py-8">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Search Books
            </h1>
            <p className="text-gray-600">
              Search millions of books and add them to your library
            </p>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or ISBN..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-3 bg-[#E07A5F] text-white rounded-lg hover:bg-[#d16a4f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Loading State */}
          {isSearching && (
            <div className="flex justify-center items-center py-20">
              <Loader className="animate-spin text-[#E07A5F]" size={40} />
            </div>
          )}

          {/* Empty State - No Search Yet */}
          {!hasSearched && !isSearching && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Start Searching
              </h2>
              <p className="text-gray-600">
                Enter a book title, author name, or ISBN to begin
              </p>
            </div>
          )}

          {/* Empty State - No Results */}
          {hasSearched && !isSearching && searchResults.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                No books found
              </h2>
              <p className="text-gray-600">
                Try a different search term
              </p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <>
              <div className="mb-4 text-gray-600">
                Found {searchResults.length} books
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((book) => (
                  <BookCard
                    key={book.googleBooksId}
                    book={book}
                    onAdd={handleAddBook}
                    isInLibrary={userLibraryIds.has(book.googleBooksId)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
