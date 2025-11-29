import { create } from 'zustand';
import {
  addBookToLibrary,
  getUserLibrary,
  getUserStats,
  updateBookStatus,
  removeBookFromLibrary
} from '../services/booksService';

const useBookStore = create((set, get) => ({
  library: [],
  stats: {
    totalBooks: 0,
    booksRead: 0,
    currentlyReading: 0,
    wantToRead: 0
  },
  loading: false,
  error: null,
  successMessage: null,

  // Add a book to user's library
  addToLibrary: async (bookData, status) => {
    set({ loading: true, error: null });
    try {
      const result = await addBookToLibrary(bookData, status);

      if (result.success) {
        // Refresh library and stats after adding
        await get().fetchLibrary();
        await get().fetchStats();
        set({ loading: false, successMessage: 'Book added to library successfully!' });

        // Success message should be cleared by the component after 3 seconds
        // (see component logic for clearing)
        return { success: true };
      } else {
        set({ loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to add book';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Fetch user's library
  fetchLibrary: async (status = null) => {
    set({ loading: true, error: null });
    try {
      const result = await getUserLibrary(status);

      if (result.success) {
        set({ library: result.data, loading: false });
      } else {
        set({ loading: false, error: result.error });
      }
    } catch (error) {
      set({ loading: false, error: error.message || 'Failed to fetch library' });
    }
  },

  // Fetch user's statistics
  fetchStats: async () => {
    try {
      const result = await getUserStats();

      if (result.success) {
        set({ stats: result.data });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  // Update book status in library
  updateBookStatus: async (bookId, newStatus) => {
    set({ loading: true, error: null });
    try {
      const result = await updateBookStatus(bookId, newStatus);

      if (result.success) {
        // Update the library item locally
        set(state => ({
          library: state.library.map(item =>
            item.bookId === bookId ? { ...item, status: newStatus } : item
          ),
          loading: false,
          successMessage: 'Book status updated successfully!'
        }));

        // Refresh stats
        await get().fetchStats();

        // Clear success message after 3 seconds
        setTimeout(() => set({ successMessage: null }), 3000);
        return { success: true };
      } else {
        set({ loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update status';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Remove book from library
  removeFromLibrary: async (bookId) => {
    set({ loading: true, error: null });
    try {
      const result = await removeBookFromLibrary(bookId);

      if (result.success) {
        // Remove the book locally
        set(state => ({
          library: state.library.filter(item => item.bookId !== bookId),
          loading: false,
          successMessage: 'Book removed from library successfully!'
        }));

        // Refresh stats
        await get().fetchStats();

        // Clear success message after 3 seconds
        setTimeout(() => set({ successMessage: null }), 3000);
        return { success: true };
      } else {
        set({ loading: false, error: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to remove book';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear success message
  clearSuccess: () => set({ successMessage: null }),

  // Add a book (alias for addToLibrary for compatibility)
  addBook: async (bookData, status = 'want-to-read') => {
    return await get().addToLibrary(bookData, status);
  },

  // Check if a book is already in the library
  isInLibrary: (googleBooksId) => {
    const { library } = get();
    return library.some(item =>
      item.book?.googleBooksId === googleBooksId ||
      item.googleBooksId === googleBooksId
    );
  }
}));

export default useBookStore;
