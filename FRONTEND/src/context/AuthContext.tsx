import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import type { ReactNode } from "react";
import client from "../api/client";

/**
 * Типы
 */
// export type User = {
//   id: string;
//   email: string;
//   name?: string;
//   role?: 'ROLE_CONSIGNER' | 'ROLE_CARRIER';
// };

// В AuthContext.tsx обновим тип User
export type User = {
    id: string;
    email: string;
    name?: string;
    role?: "ROLE_CONSIGNER" | "ROLE_CARRIER";
    // Добавляем поля для профиля из users.ts
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    birthDate?: string;
    licenseCategories?: string; // только для ROLE_CARRIER
};

type AuthState = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
};

type AuthContextType = AuthState & {
    login: (token: string, user?: User | null, remember?: boolean) => void;
    logout: () => void;
    setLoading: (v: boolean) => void;
    updateUser: (userData: Partial<User>) => void;
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
    updateUser: () => {
        throw new Error("AuthProvider not initialized");
    },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

const LS_KEY = "myapp_auth_v1";
const SS_KEY = "myapp_auth_session_v1";

function loadFromStorage(): { user: User | null; token: string | null } {
    try {
        const rawLocal = localStorage.getItem(LS_KEY);
        if (rawLocal) {
            const parsed = JSON.parse(rawLocal);
            return { user: parsed.user ?? null, token: parsed.token ?? null };
        }
        const rawSession = sessionStorage.getItem(SS_KEY);
        if (rawSession) {
            const parsed = JSON.parse(rawSession);
            return { user: parsed.user ?? null, token: parsed.token ?? null };
        }
        return { user: null, token: null };
    } catch {
        return { user: null, token: null };
    }
}

function saveToStorage(
    user: User | null,
    token: string | null,
    remember = true
) {
    try {
        const payload = JSON.stringify({ user, token });
        if (remember) {
            localStorage.setItem(LS_KEY, payload);
            sessionStorage.removeItem(SS_KEY);
        } else {
            // сохраняем во временное хранилище, которое очистится при закрытии вкладки
            sessionStorage.setItem(SS_KEY, payload);
            localStorage.removeItem(LS_KEY);
        }
    } catch {
        // ignore
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const initial = loadFromStorage();
    const [user, setUser] = useState<User | null>(initial.user);
    const [token, setToken] = useState<string | null>(initial.token);
    const [loading, setLoading] = useState<boolean>(false);

    // Устанавливаем заголовок Authorization для всех запросов axios
    useEffect(() => {
        if (token) {
            client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete client.defaults.headers.common["Authorization"];
        }
    }, [token]);

    const login = (t: string, u: User | null = null, remember = true) => {
        setUser(u);
        setToken(t);
        saveToStorage(u, t, remember);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        try {
            localStorage.removeItem(LS_KEY);
            sessionStorage.removeItem(SS_KEY);
        } catch {}
        delete client.defaults.headers.common["Authorization"];
    };
    // И в реализации AuthProvider добавим:
    // В AuthContext.tsx замени функцию updateUser на:
    const updateUser = useCallback((userData: Partial<User>) => {
        setUser((prev) => (prev ? { ...prev, ...userData } : null));
    }, []);

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        setLoading,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export function useAuth(): AuthContextType {
    return useContext(AuthContext);
}
