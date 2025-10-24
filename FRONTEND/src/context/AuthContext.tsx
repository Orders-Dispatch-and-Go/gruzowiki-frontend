import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

/**
 * Типы
 */
export type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
};

type AuthContextType = AuthState & {
  login: (user: User, token: string, remember?: boolean) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
};
const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  login: () => {
    throw new Error("AuthProvider not initialized");
  },
  logout: () => {
    throw new Error("AuthProvider not initialized");
  },
  setLoading: () => {
    throw new Error("AuthProvider not initialized");
  },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);


// const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_KEY = "myapp_auth_v1";

function loadFromStorage(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw);
    // Простейшая валидация
    return { user: parsed.user ?? null, token: parsed.token ?? null };
  } catch {
    return { user: null, token: null };
  }
}

function saveToStorage(user: User | null, token: string | null, remember = true) {
  try {
    if (!remember) {
      // если не запоминать — ничего не сохраняем
      return;
    }
    const payload = JSON.stringify({ user, token });
    localStorage.setItem(LS_KEY, payload);
  } catch {
    // ignore
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initial = loadFromStorage();
  const [user, setUser] = useState<User | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // если токен есть, можно (опционально) вызывать API /me чтобы проверить токен
    // TODO: add token validation call if backend supports it
  }, []);

  const login = (u: User, t: string, remember = true) => {
    setUser(u);
    setToken(t);
    saveToStorage(u, t, remember);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
