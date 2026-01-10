import { createContext, useContext, useState, useMemo } from "react";
import type { Viewer } from "@/types/Viewer";
import { clearTokens, getRefreshToken } from "@/utils/token";
import { logoutApi } from "@/api/auth.api";

interface AuthContextType {
  viewer: Viewer | null;
  isLoggedIn: boolean;
  login: (user: Viewer) => void;
  signup: (user: Viewer) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [viewer, setViewer] = useState<Viewer | null>(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  });

  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const login = (user: Viewer) => {
    setViewer(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const signup = (user: Viewer) => {
    setViewer(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } finally {
      clearTokens();
      localStorage.removeItem("user");
      setViewer(null);
    }
  };

  const value = useMemo(
    () => ({ viewer, isLoggedIn, login, signup, logout }),
    [viewer, isLoggedIn]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}