import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("iq_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((data) => {
    localStorage.setItem("iq_access_token", data.access_token);
    localStorage.setItem("iq_refresh_token", data.refresh_token);
    localStorage.setItem("iq_user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("iq_access_token");
    localStorage.removeItem("iq_refresh_token");
    localStorage.removeItem("iq_user");
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("iq_access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((freshUser) => {
        localStorage.setItem("iq_user", JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, [clearSession]);

  const register = async (payload) => {
    const data = await authService.register(payload);
    persistSession(data);
    return data.user;
  };

  const login = async (payload) => {
    const data = await authService.login(payload);
    persistSession(data);
    return data.user;
  };

  const loginWithTokens = (access_token, refresh_token, freshUser) => {
    localStorage.setItem("iq_access_token", access_token);
    localStorage.setItem("iq_refresh_token", refresh_token);
    localStorage.setItem("iq_user", JSON.stringify(freshUser));
    setUser(freshUser);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // token might already be invalid; clear locally regardless
    }
    clearSession();
  };

  const refreshUser = async () => {
    const freshUser = await authService.me();
    localStorage.setItem("iq_user", JSON.stringify(freshUser));
    setUser(freshUser);
    return freshUser;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, loginWithTokens, refreshUser, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
