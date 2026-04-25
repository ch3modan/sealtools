import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  accessToken: string | null;
  referralVerified: boolean;
  error: string | null;

  setAuth: (data: {
    userId: string;
    email: string;
    displayName: string;
    accessToken: string;
  }) => void;
  setReferralVerified: (verified: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: false,
      userId: null,
      email: null,
      displayName: null,
      accessToken: null,
      referralVerified: false,
      error: null,

      setAuth: (data) =>
        set({
          isAuthenticated: true,
          userId: data.userId,
          email: data.email,
          displayName: data.displayName,
          accessToken: data.accessToken,
          error: null,
        }),

      setReferralVerified: (verified) => set({ referralVerified: verified }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      logout: () =>
        set({
          isAuthenticated: false,
          userId: null,
          email: null,
          displayName: null,
          accessToken: null,
          referralVerified: false,
          error: null,
        }),
    }),
    {
      name: 'sealtools-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
