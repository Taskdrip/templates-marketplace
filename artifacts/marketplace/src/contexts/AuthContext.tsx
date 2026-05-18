import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useGetMe, User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("cm_token"));
  const [localUser, setLocalUser] = useState<User | null>(null);
  const isLoggingOut = useRef(false);

  const { data: user, isLoading: isQueryLoading, isError, error } = useGetMe({
    query: {
      enabled: !!token && !isLoggingOut.current,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  useEffect(() => {
    if (user) {
      setLocalUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (isError && token) {
      const apiError = error as any;
      if (apiError?.status === 401) {
        isLoggingOut.current = true;
        setToken(null);
        setLocalUser(null);
        localStorage.removeItem("cm_token");
        setTimeout(() => { isLoggingOut.current = false; }, 500);
      }
    }
  }, [isError, error, token]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("cm_token", newToken);
    setToken(newToken);
    setLocalUser(userData);
    isLoggingOut.current = false;
  };

  const logout = () => {
    isLoggingOut.current = true;
    localStorage.removeItem("cm_token");
    setToken(null);
    setLocalUser(null);
    setTimeout(() => { isLoggingOut.current = false; }, 500);
  };

  const isAdmin = localUser?.role === "admin";
  const isLoading = !!token && !localUser && isQueryLoading;

  return (
    <AuthContext.Provider value={{ user: localUser, isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
