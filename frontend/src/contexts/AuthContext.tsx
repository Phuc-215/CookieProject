import { createContext, useContext, useState, useMemo, useEffect } from "react";
import type { Viewer } from "@/types/Viewer";
import { clearTokens, getRefreshToken } from "@/utils/token";
import { logoutApi } from "@/api/auth.api";
import { getUserProfileApi } from "@/api/user.api";

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

  const isLoggedIn = Boolean(viewer && localStorage.getItem("accessToken"));

  // Fetch full user profile on mount if user is logged in
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && viewer?.id) {
      getUserProfileApi(viewer.id)
        .then((res) => {
          const updatedUser: Viewer = {
            id: res.data.id,
            username: res.data.username,
            email: viewer.email, // Keep email from localStorage if available
            avatar_url: res.data.avatar_url,
          };
          setViewer(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        })
        .catch((err) => {
          console.error('Failed to fetch user profile:', err);
        });
    }
  }, [viewer?.id]);

  const login = (user: Viewer) => {
    setViewer(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const signup = (user: Viewer) => {
    // Don't set viewer or tokens yet - user must verify email first
    // Verification endpoint will call login() with tokens
    console.log('Signup completed for:', user.email);
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