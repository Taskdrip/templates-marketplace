import React, { createContext, useContext, useState, useEffect } from "react";
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

  const { data: user, isLoading: isQueryLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: ["/api/auth/me"],
    },
  });

  useEffect(() => {
    if (user) {
      setLocalUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (isError) {
      setToken(null);
      setLocalUser(null);
      localStorage.removeItem("cm_token");
    }
  }, [isError]);

  const login = (newToken: string, user: User) => {
    localStorage.setItem("cm_token", newToken);
    setToken(newToken);
    setLocalUser(user);
  };

  const logout = () => {
    localStorage.removeItem("cm_token");
    setToken(null);
    setLocalUser(null);
  };

  const isAdmin = localUser?.role === "admin";
  const isLoading = token ? isQueryLoading && !localUser : false;

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
