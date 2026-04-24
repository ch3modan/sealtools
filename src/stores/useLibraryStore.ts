import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book } from '../types/book';

interface LibraryState {
  books: Book[];
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  getBook: (id: string) => Book | undefined;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      books: [],

      addBook: (book) => set((s) => ({ books: [...s.books, book] })),

      removeBook: (id) =>
        set((s) => ({ books: s.books.filter((b) => b.id !== id) })),

      getBook: (id) => get().books.find((b) => b.id === id),
    }),
    {
      name: 'sealtools-library',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
