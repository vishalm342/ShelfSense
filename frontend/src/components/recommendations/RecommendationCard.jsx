import { useState } from 'react';
import { Star, BookOpen, Lightbulb, Plus, Check } from 'lucide-react';
import useBookStore from '../../store/bookStore';

/**
 * RecommendationCard Component
 *
 * Displays a single book recommendation with:
 * - Book cover image
 * - Title and author
 * - Rating and page count
 * - Why recommended reason
 * - Add to Library button
 */
export default function RecommendationCard({ book }) {
  const { addBook, isInLibrary } = useBookStore();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Check if book is already in library
  const inLibrary = isInLibrary(book.googleBooksId);

  const handleAddToLibrary = async () => {
    if (added || inLibrary) return;

    console.log('Adding book to library:', book.title);
    setIsAdding(true);

    try {
      const result = await addBook({
        googleBooksId: book.googleBooksId,
        title: book.title,
        subtitle: book.subtitle || null,
        authors: book.authors || ['Unknown Author'],
        description: book.description || 'No description available',
        thumbnailUrl: book.thumbnail || null,
        coverUrl: book.thumbnail || null,
        categories: book.categories || [],
        publisher: book.publisher || null,
        publishedDate: book.publishedDate || null,
        pageCount: book.pageCount || 0,
        averageRating: book.averageRating || 0,
        ratingsCount: book.ratingsCount || 0,
        language: book.language || 'en',
      });

      if (result.success) {
        console.log('✅ Book added successfully:', book.title);
        setAdded(true);
      } else {
        console.error('❌ Failed to add book:', result.error);
      }
    } catch (error) {
      console.error('❌ Error adding book:', error);
    } finally {
      setIsAdding(false);
    }
  };

  // Format rating display
  const rating = book.averageRating || 0;
  const ratingText = rating > 0 ? rating.toFixed(1) : 'N/A';

  return (
    <div className="bg-white rounded-lg border border-[var(--color-accent-sage)]/30 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
      {/* Book Cover */}
      <div className="aspect-[2/3] bg-gradient-to-br from-[var(--color-accent-sage)]/20 to-[var(--color-primary)]/10 relative overflow-hidden">
        {book.thumbnail ? (
          <img
            src={book.thumbnail.replace('http:', 'https:')}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ display: book.thumbnail ? 'none' : 'flex' }}
        >
          <BookOpen className="w-16 h-16 text-[var(--color-primary)]/30" />
        </div>

        {/* Rating Badge */}
        {rating > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-[var(--color-text-forest)]">
              {ratingText}
            </span>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-display text-lg font-bold text-[var(--color-text-forest)] mb-1 line-clamp-2 group-hover:text-[var(--color-primary)] transition">
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-sm text-[var(--color-text-charcoal)] mb-3 line-clamp-1">
          by {book.authors?.join(', ') || 'Unknown Author'}
        </p>

        {/* Genre & Page Count */}
        <div className="flex items-center gap-3 mb-3 text-xs text-[var(--color-text-charcoal)]">
          {book.genre && (
            <span className="px-2 py-1 bg-[var(--color-primary)]/10 rounded-full font-medium">
              {book.genre}
            </span>
          )}
          {book.pageCount > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {book.pageCount} pages
            </span>
          )}
        </div>

        {/* Why Recommended */}
        {book.reason && (
          <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent-sage)]/5 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[var(--color-primary)] mb-1">
                  Why recommended
                </p>
                <p className="text-xs text-[var(--color-text-charcoal)] leading-relaxed line-clamp-3">
                  {book.reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add to Library Button */}
        <button
          onClick={handleAddToLibrary}
          disabled={isAdding || added || inLibrary}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
            added || inLibrary
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 hover:shadow-md active:scale-95'
          } ${isAdding ? 'opacity-70 cursor-wait' : ''}`}
        >
          {added || inLibrary ? (
            <>
              <Check className="w-4 h-4" />
              <span>In Library</span>
            </>
          ) : isAdding ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add to Library</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
