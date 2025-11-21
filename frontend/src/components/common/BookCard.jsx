import { useState } from 'react'
import { Check, Plus, ChevronDown } from 'lucide-react'

export default function BookCard({ book, onAdd, isInLibrary = false, showActions = true }) {
  const [isAdding, setIsAdding] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const handleAdd = async (status) => {
    setIsAdding(true)
    setShowStatusMenu(false)
    await onAdd(book, status)
    setIsAdding(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      {/* Book Cover */}
      <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
        {book.thumbnailUrl ? (
          <img
            src={book.thumbnailUrl}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-4xl">📚</div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[3rem]">
          {book.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {book.authors.join(', ')}
        </p>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {book.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {book.averageRating && (
            <span className="flex items-center gap-1">
              ⭐ {book.averageRating.toFixed(1)}
            </span>
          )}
          {book.pageCount && (
            <span>{book.pageCount} pages</span>
          )}
        </div>

        {/* Action Button */}
        {showActions && (
          <div className="relative">
            {isInLibrary ? (
              <button
                disabled
                className="w-full bg-green-100 text-green-700 py-2 rounded-lg flex items-center justify-center gap-2 font-medium"
              >
                <Check size={16} />
                In Library
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  disabled={isAdding}
                  className="w-full bg-[#E07A5F] text-white py-2 rounded-lg hover:bg-[#d16a4f] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isAdding ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add to Library
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>

                {/* Status Dropdown Menu */}
                {showStatusMenu && !isAdding && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowStatusMenu(false)}
                    ></div>

                    {/* Dropdown */}
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={() => handleAdd('want_to_read')}
                          className="w-full px-4 py-3 text-left hover:bg-[#F4F1DE] transition flex items-center gap-2 text-gray-700"
                        >
                          <span className="text-lg">📚</span>
                          <div>
                            <div className="font-medium">Want to Read</div>
                            <div className="text-xs text-gray-500">Add to reading list</div>
                          </div>
                        </button>

                        <button
                          onClick={() => handleAdd('currently_reading')}
                          className="w-full px-4 py-3 text-left hover:bg-[#F4F1DE] transition flex items-center gap-2 text-gray-700"
                        >
                          <span className="text-lg">📖</span>
                          <div>
                            <div className="font-medium">Currently Reading</div>
                            <div className="text-xs text-gray-500">You're reading this now</div>
                          </div>
                        </button>

                        <button
                          onClick={() => handleAdd('read')}
                          className="w-full px-4 py-3 text-left hover:bg-[#F4F1DE] transition flex items-center gap-2 text-gray-700"
                        >
                          <span className="text-lg">✅</span>
                          <div>
                            <div className="font-medium">Already Read</div>
                            <div className="text-xs text-gray-500">You've finished this book</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
