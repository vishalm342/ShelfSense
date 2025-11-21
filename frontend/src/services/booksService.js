import { supabase } from '../lib/supabase'

// Search Google Books API
export async function searchBooks(query) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`
    )
    const data = await response.json()

    if (!data.items) return []

    // Format books for our app
    return data.items.map(item => ({
      googleBooksId: item.id,
      title: item.volumeInfo.title || 'Unknown Title',
      subtitle: item.volumeInfo.subtitle || null,
      authors: item.volumeInfo.authors || ['Unknown Author'],
      description: item.volumeInfo.description || 'No description available',
      categories: item.volumeInfo.categories || [],
      thumbnailUrl: item.volumeInfo.imageLinks?.thumbnail || null,
      coverUrl: item.volumeInfo.imageLinks?.large || item.volumeInfo.imageLinks?.medium || null,
      isbn10: item.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || null,
      isbn13: item.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || null,
      publisher: item.volumeInfo.publisher || null,
      publishedDate: item.volumeInfo.publishedDate || null,
      pageCount: item.volumeInfo.pageCount || null,
      averageRating: item.volumeInfo.averageRating || null,
      ratingsCount: item.volumeInfo.ratingsCount || null
    }))
  } catch (error) {
    console.error('Error searching books:', error)
    throw new Error('Failed to search books')
  }
}

// Add book to user's library
export async function addBookToLibrary(bookData, userId, status = 'want_to_read') {
  try {
    // Check if book already exists in books table
    const { data: existingBook, error: searchError } = await supabase
      .from('books')
      .select('id')
      .eq('google_books_id', bookData.googleBooksId)
      .single()

    let bookId

    if (existingBook) {
      bookId = existingBook.id
    } else {
      // Insert new book
      const { data: newBook, error: insertError } = await supabase
        .from('books')
        .insert({
          google_books_id: bookData.googleBooksId,
          title: bookData.title,
          subtitle: bookData.subtitle,
          authors: bookData.authors,
          description: bookData.description,
          categories: bookData.categories,
          thumbnail_url: bookData.thumbnailUrl,
          cover_url: bookData.coverUrl,
          isbn_10: bookData.isbn10,
          isbn_13: bookData.isbn13,
          publisher: bookData.publisher,
          published_date: bookData.publishedDate,
          page_count: bookData.pageCount,
          average_rating: bookData.averageRating,
          ratings_count: bookData.ratingsCount
        })
        .select()
        .single()

      if (insertError) throw insertError
      bookId = newBook.id
    }

    // Check if user already has this book
    const { data: existingLibraryEntry } = await supabase
      .from('user_libraries')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single()

    if (existingLibraryEntry) {
      throw new Error('Book already in your library')
    }

    // Add to user's library
    const { data: libraryEntry, error: libraryError } = await supabase
      .from('user_libraries')
      .insert({
        user_id: userId,
        book_id: bookId,
        status: status,
        source: 'manual',
        date_added: new Date().toISOString()
      })
      .select()
      .single()

    if (libraryError) throw libraryError

    return { success: true, data: libraryEntry }
  } catch (error) {
    console.error('Error adding book:', error)
    return { success: false, error: error.message }
  }
}

// Get user's library
export async function getUserLibrary(userId) {
  try {
    const { data, error } = await supabase
      .from('user_libraries')
      .select(`
        *,
        books (*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching library:', error)
    return { success: false, error: error.message }
  }
}

// Update book status
export async function updateBookStatus(libraryId, newStatus) {
  try {
    const updates = {
      status: newStatus
    }

    // Set dates based on status
    if (newStatus === 'currently_reading') {
      updates.date_started = new Date().toISOString()
    } else if (newStatus === 'read') {
      updates.date_finished = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_libraries')
      .update(updates)
      .eq('id', libraryId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error updating status:', error)
    return { success: false, error: error.message }
  }
}

// Remove book from library
export async function removeBookFromLibrary(libraryId) {
  try {
    const { error } = await supabase
      .from('user_libraries')
      .delete()
      .eq('id', libraryId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error removing book:', error)
    return { success: false, error: error.message }
  }
}
