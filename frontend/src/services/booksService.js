import api from './api';

// Search Google Books API through our backend
// Now uses authenticated backend endpoint with API key for better rate limits
export async function searchBooks(query) {
  try {
    // Call our backend API which securely uses the Google Books API key
    // Benefits of using backend proxy:
    // 1. API key is kept secret on the server (not exposed in frontend code)
    // 2. Higher rate limits (1000 requests/day vs 100/day)
    // 3. Better tracking and monitoring of API usage
    // 4. Consistent error handling and response format
    const response = await api.get('/books/search', {
      params: { q: query }
    })

    return response.data.data || []
  } catch (error) {
    console.error('Error searching books:', error)
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to search books'
    throw new Error(errorMessage)
  }
}

// Add book to user's library
export async function addBookToLibrary(bookData, status = 'want_to_read') {
  try {
    const response = await api.post('/books', {
      googleBooksId: bookData.googleBooksId,
      title: bookData.title,
      subtitle: bookData.subtitle,
      authors: bookData.authors,
      description: bookData.description,
      categories: bookData.categories,
      thumbnailUrl: bookData.thumbnailUrl,
      coverUrl: bookData.coverUrl,
      isbn10: bookData.isbn10,
      isbn13: bookData.isbn13,
      publisher: bookData.publisher,
      publishedDate: bookData.publishedDate,
      pageCount: bookData.pageCount,
      averageRating: bookData.averageRating,
      ratingsCount: bookData.ratingsCount,
      language: bookData.language,
      status: status
    })
    return { success: true, data: response.data.data }
  } catch (error) {
    console.error('Error adding book:', error)
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to add book'
    return { success: false, error: errorMessage }
  }
}

// Get user's library
export async function getUserLibrary(status = null) {
  try {
    const params = status ? { status } : {}
    const response = await api.get('/books', { params })
    return { success: true, data: response.data.data }
  } catch (error) {
    console.error('Error fetching library:', error)
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to fetch library'
    return { success: false, error: errorMessage }
  }
}

// Get user's library statistics
export async function getUserStats() {
  try {
    const response = await api.get('/books/stats')
    return { success: true, data: response.data.data }
  } catch (error) {
    console.error('Error fetching stats:', error)
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to fetch stats'
    return { success: false, error: errorMessage }
  }
}

// Update book status
export async function updateBookStatus(bookId, newStatus) {
  try {
    const response = await api.put(`/books/${bookId}/status`, {
      status: newStatus
    })
    return { success: true, data: response.data.data }
  } catch (error) {
    console.error('Error updating status:', error)
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to update status'
    return { success: false, error: errorMessage }
  }
}

// Remove book from library
export async function removeBookFromLibrary(bookId) {
  try {
    const response = await api.delete(`/books/${bookId}`)
    return { success: true, data: response.data.data }
  } catch (error) {
    console.error('Error removing book:', error)
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to remove book'
    return { success: false, error: errorMessage }
  }
}

// Check if book is in user's library
export async function checkBookInLibrary(googleBooksId) {
  try {
    const response = await api.get(`/books/check/${googleBooksId}`)
    return { success: true, data: response.data.data }
  } catch (error) {
    console.error('Error checking book:', error)
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to check book'
    return { success: false, error: errorMessage }
  }
}
