import { create } from 'zustand';
import { Bookmark } from '../types/book';

interface ReaderState {
  currentBookId: string | null;
  currentWordIndex: number;
  currentChapter: number;
  totalWords: number;
  progress: number;
  isPlaying: boolean;
  wpm: number;
  words: string[];
  bookmarks: Bookmark[];

  setBook: (bookId: string, words: string[], totalWords: number) => void;
  setWordIndex: (index: number) => void;
  setPlaying: (playing: boolean) => void;
  togglePlaying: () => void;
  setWpm: (wpm: number) => void;
  setChapter: (chapter: number) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  reset: () => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentBookId: null,
  currentWordIndex: 0,
  currentChapter: 0,
  totalWords: 0,
  progress: 0,
  isPlaying: false,
  wpm: 250,
  words: [],
  bookmarks: [],

  setBook: (bookId, words, totalWords) =>
    set({
      currentBookId: bookId,
      words,
      totalWords,
      currentWordIndex: 0,
      currentChapter: 0,
      progress: 0,
      isPlaying: false,
    }),

  setWordIndex: (index) => {
    const { totalWords } = get();
    set({
      currentWordIndex: index,
      progress: totalWords > 0 ? index / totalWords : 0,
    });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),
  togglePlaying: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setWpm: (wpm) => set({ wpm }),
  setChapter: (chapter) => set({ currentChapter: chapter }),

  addBookmark: (bookmark) =>
    set((s) => ({ bookmarks: [...s.bookmarks, bookmark] })),

  removeBookmark: (id) =>
    set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),

  reset: () =>
    set({
      currentBookId: null,
      currentWordIndex: 0,
      currentChapter: 0,
      totalWords: 0,
      progress: 0,
      isPlaying: false,
      words: [],
    }),
}));
