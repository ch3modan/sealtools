import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book } from '../types/book';
import { useAuthStore } from './useAuthStore';
import * as api from '../lib/api';

interface LibraryState {
  books: Book[];
  addBook: (book: Book) => void;
  removeBook: (id: string) => Promise<void>;
  getBook: (id: string) => Book | undefined;
  setBooks: (books: Book[]) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      books: [],

      addBook: (book) => set((s) => ({ books: [...s.books, book] })),

      removeBook: async (id) => {
        // Optimistic UI update
        set((s) => ({ books: s.books.filter((b) => b.id !== id) }));
        
        // Cloud sync
        const user = useAuthStore.getState().user;
        if (user && !id.startsWith('demo-')) {
          try {
            await api.deleteBook(id, user.userId);
          } catch (e) {
            console.error('Failed to delete book from cloud:', e);
          }
        }
      },

      getBook: (id) => get().books.find((b) => b.id === id),

      setBooks: (books) => set({ books }),
    }),
    {
      name: 'sealtools-library',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
