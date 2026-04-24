import { create } from 'zustand';
import dayjs from 'dayjs';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  readingHistory: string[];
  totalBooksRead: number;
  totalWordsRead: number;
  todayWordsRead: number;
  dailyGoal: number;

  logReading: (wordsRead: number) => void;
  checkStreak: () => void;
  setDailyGoal: (goal: number) => void;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null,
  readingHistory: [],
  totalBooksRead: 0,
  totalWordsRead: 0,
  todayWordsRead: 0,
  dailyGoal: 1000,

  logReading: (wordsRead) => {
    const today = dayjs().format('YYYY-MM-DD');
    const state = get();
    const newTodayWords = state.todayWordsRead + wordsRead;
    const newTotalWords = state.totalWordsRead + wordsRead;

    const updates: Partial<StreakState> = {
      todayWordsRead: newTodayWords,
      totalWordsRead: newTotalWords,
    };

    // Check if daily goal met for the first time today
    if (newTodayWords >= state.dailyGoal && state.lastReadDate !== today) {
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      const isConsecutive = state.lastReadDate === yesterday;

      const newStreak = isConsecutive ? state.currentStreak + 1 : 1;
      updates.currentStreak = newStreak;
      updates.longestStreak = Math.max(newStreak, state.longestStreak);
      updates.lastReadDate = today;
      updates.readingHistory = [...state.readingHistory, today];
    }

    set(updates);
  },

  checkStreak: () => {
    const state = get();
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    // Reset today's count if it's a new day
    if (state.lastReadDate !== today) {
      set({ todayWordsRead: 0 });
    }

    // Check if streak is broken (missed more than 1 day)
    if (state.lastReadDate && state.lastReadDate !== today && state.lastReadDate !== yesterday) {
      set({ currentStreak: 0 });
    }
  },

  setDailyGoal: (goal) => set({ dailyGoal: goal }),
}));
