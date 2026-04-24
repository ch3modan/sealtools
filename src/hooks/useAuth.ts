import { useCallback } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import * as api from '../lib/api';

/**
 * Custom email/password auth hook.
 * Manages signup, login, and logout flows through the Azure Functions API.
 * No Microsoft SSO — fully self-hosted.
 */
export function useAuth() {
  const { isAuthenticated, isLoading, error } = useAuthStore();

  const signup = useCallback(async (
    email: string,
    password: string,
    displayName: string,
    referralCode: string
  ) => {
    useAuthStore.getState().setLoading(true);
    useAuthStore.getState().setError(null);

    try {
      const response = await api.signup(email, password, displayName, referralCode);
      useAuthStore.getState().setAuth({
        userId: response.user.userId,
        email: response.user.email,
        displayName: response.user.displayName,
        accessToken: response.user.sessionToken,
      });
      useAuthStore.getState().setReferralVerified(true);
    } catch (err: any) {
      useAuthStore.getState().setError(err.message || 'Signup failed');
      throw err;
    } finally {
      useAuthStore.getState().setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    useAuthStore.getState().setLoading(true);
    useAuthStore.getState().setError(null);

    try {
      const response = await api.login(email, password);
      useAuthStore.getState().setAuth({
        userId: response.user.userId,
        email: response.user.email,
        displayName: response.user.displayName,
        accessToken: response.user.sessionToken,
      });
      useAuthStore.getState().setReferralVerified(true);
    } catch (err: any) {
      useAuthStore.getState().setError(err.message || 'Login failed');
      throw err;
    } finally {
      useAuthStore.getState().setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    useAuthStore.getState().clearAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    signup,
    login,
    logout,
  };
}
