import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import type { User } from "../types";

type AuthState = {
  readonly isLoading: boolean;
  readonly isAuthenticated: boolean;
  readonly user: User | null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      const userJson = await SecureStore.getItemAsync("user");

      if (token && userJson) {
        setState({
          isLoading: false,
          isAuthenticated: true,
          user: JSON.parse(userJson),
        });
      } else {
        setState({ isLoading: false, isAuthenticated: false, user: null });
      }
    } catch {
      setState({ isLoading: false, isAuthenticated: false, user: null });
    }
  };

  const login = useCallback(async (tokens: { access_token: string; refresh_token: string }, user: User) => {
    await SecureStore.setItemAsync("access_token", tokens.access_token);
    await SecureStore.setItemAsync("refresh_token", tokens.refresh_token);
    await SecureStore.setItemAsync("user", JSON.stringify(user));
    setState({ isLoading: false, isAuthenticated: true, user });
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    await SecureStore.deleteItemAsync("user");
    setState({ isLoading: false, isAuthenticated: false, user: null });
  }, []);

  return { ...state, login, logout, checkAuth };
}
