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

export type User = {
    id: string;
    email: string;
    name?: string;
    // ROLE_CONSIGNER = shipper - отправитель
    // ROLE_CARRIER - перевозчик
    role?: "ROLE_CONSIGNER" | "ROLE_CARRIER";
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
            console.log("AuthContext: Loading from localStorage", rawLocal);
            const parsed = JSON.parse(rawLocal);
            return { user: parsed.user ?? null, token: parsed.token ?? null };
        }
        const rawSession = sessionStorage.getItem(SS_KEY);
        if (rawSession) {
            console.log("AuthContext: Loading from sessionStorage", rawSession);
            const parsed = JSON.parse(rawSession);
            return { user: parsed.user ?? null, token: parsed.token ?? null };
        }
        console.log("AuthContext: No auth data in storage");
        return { user: null, token: null };
    } catch (error) {
        console.error("AuthContext: Error loading from storage", error);
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
        console.log("AuthContext: Saving to storage", { user, token, remember });
        if (remember) {
            localStorage.setItem(LS_KEY, payload);
            sessionStorage.removeItem(SS_KEY);
        } else {
            sessionStorage.setItem(SS_KEY, payload);
            localStorage.removeItem(LS_KEY);
        }
    } catch (error) {
        console.error("AuthContext: Error saving to storage", error);
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const initial = loadFromStorage();
    console.log("AuthProvider: Initial state", initial);
    
    const [user, setUser] = useState<User | null>(initial.user);
    const [token, setToken] = useState<string | null>(initial.token);
    const [loading, setLoading] = useState<boolean>(false);

    // Устанавливаем заголовок Authorization для всех запросов axios
    useEffect(() => {
        console.log("AuthProvider: Setting axios headers", { token });
        if (token) {
            client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete client.defaults.headers.common["Authorization"];
        }
    }, [token]);

    // const login = (t: string, u: User | null = null, remember = true) => {
    //     console.log("AuthContext: login called", { token: t, user: u, remember });
    //     setUser(u);
    //     setToken(t);
    //     saveToStorage(u, t, remember);
    // };

    const login = (t: string, u: User | null = null, remember = true) => {
    console.log("AuthContext: login called", { token: t, user: u, remember });

    const normalizedUser = u
        ? {
              id: u.id,
              email: u.email,
              name: u.name ?? "",
              role: u.role ?? "ROLE_CONSIGNER",
              firstName: u.firstName ?? "",
              lastName: u.lastName ?? "",
              middleName: u.middleName ?? "",
              phone: u.phone ?? "",
              birthDate: u.birthDate ?? "",
              licenseCategories: u.licenseCategories ?? "",
          }
        : null;

    setUser(normalizedUser);
    setToken(t);
    saveToStorage(normalizedUser, t, remember);
};


    const logout = () => {
        console.log("AuthContext: logout called");
        setUser(null);
        setToken(null);
        try {
            localStorage.removeItem(LS_KEY);
            sessionStorage.removeItem(SS_KEY);
        } catch {}
        delete client.defaults.headers.common["Authorization"];
    };
    
    const updateUser = useCallback((userData: Partial<User>) => {
        console.log("AuthContext: updateUser called", userData);
        setUser((prev) => {
            const updated = prev ? { ...prev, ...userData } : null;
            console.log("AuthContext: user updated", { prev, updated });
            return updated;
        });
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
    
    console.log("AuthProvider: Rendering with value", {
        user,
        token,
        isAuthenticated: !!user,
        loading
    });

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export function useAuth(): AuthContextType {
    return useContext(AuthContext);
}
