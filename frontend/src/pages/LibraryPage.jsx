import { useEffect, useState } from 'react';
import { Loader, ChevronDown, Trash2 } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import useBookStore from '../store/bookStore';

const LibraryPage = () => {
  const [filter, setFilter] = useState('all');
  const [showStatusMenu, setShowStatusMenu] = useState(null);

  const { library, loading, fetchLibrary, updateBookStatus, removeFromLibrary, successMessage, error } = useBookStore();

  useEffect(() => {
    const statusFilter = filter === 'all' ? null : filter;
    fetchLibrary(statusFilter);
  }, [filter, fetchLibrary]);

  const handleStatusChange = async (bookId, newStatus) => {
    setShowStatusMenu(null);
    await updateBookStatus(bookId, newStatus);
  };

  const handleRemove = async (bookId, bookTitle) => {
    if (confirm(`Remove "${bookTitle}" from your library?`)) {
      await removeFromLibrary(bookId);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'want_to_read': 'Want to Read',
      'currently_reading': 'Currently Reading',
      'read': 'Read'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'want_to_read': 'bg-blue-100 text-blue-700 border-blue-200',
      'currently_reading': 'bg-orange-100 text-orange-700 border-orange-200',
      'read': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F4F1DE] py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Library</h1>
            <p className="text-gray-600">
              Manage your book collection and track your reading progress
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

          {/* Filter Buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-[#E07A5F] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              All Books
            </button>
            <button
              onClick={() => setFilter('want_to_read')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'want_to_read'
                  ? 'bg-[#E07A5F] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Want to Read
            </button>
            <button
              onClick={() => setFilter('currently_reading')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'currently_reading'
                  ? 'bg-[#E07A5F] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Currently Reading
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'read'
                  ? 'bg-[#E07A5F] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Read
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader className="animate-spin text-[#E07A5F]" size={40} />
            </div>
          )}

          {/* Empty State */}
          {!loading && library.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No books found</h2>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? 'Start adding books to your library from the search page'
                  : `You don't have any books in "${getStatusLabel(filter)}"`}
              </p>
              <button
                onClick={() => window.location.href = '/search'}
                className="px-6 py-3 bg-[#E07A5F] text-white rounded-lg hover:bg-[#d16a4f] transition"
              >
                Search Books
              </button>
            </div>
          )}

          {/* Books Grid */}
          {!loading && library.length > 0 && (
            <>
              <div className="mb-4 text-gray-600">
                {library.length} {library.length === 1 ? 'book' : 'books'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {library.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300"
                  >
                    {/* Book Cover */}
                    <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                      {item.book?.thumbnailUrl ? (
                        <img
                          src={item.book.thumbnailUrl}
                          alt={item.book.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-4xl">📚</div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[3rem]">
                        {item.book?.title || 'Unknown Title'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.book?.authors?.join(', ') || 'Unknown Author'}
                      </p>

                      {/* Status Badge */}
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 border ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {/* Change Status Button */}
                        <div className="relative flex-1">
                          <button
                            onClick={() => setShowStatusMenu(showStatusMenu === item.id ? null : item.id)}
                            className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            Change Status
                            <ChevronDown size={14} />
                          </button>

                          {/* Status Dropdown */}
                          {showStatusMenu === item.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowStatusMenu(null)}
                              ></div>

                              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                                <div className="py-1">
                                  {['want_to_read', 'currently_reading', 'read'].map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => handleStatusChange(item.bookId, status)}
                                      disabled={status === item.status}
                                      className={`w-full px-4 py-2 text-left text-sm transition ${
                                        status === item.status
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                          : 'hover:bg-[#F4F1DE] text-gray-700'
                                      }`}
                                    >
                                      {getStatusLabel(status)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(item.bookId, item.book?.title)}
                          className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition"
                          title="Remove from library"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default LibraryPage;
