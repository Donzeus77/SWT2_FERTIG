import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authApi, type AuthUser as ApiAuthUser } from "../lib/api";

export type UserType = "student" | "staff" | "guest";

export interface UserPreferences {
  dietary: string[];
  allergens: string[];
}

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  campus: string;
  matrikel: string;
  type: UserType;
}

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

interface UserContextType {
  favoriteMensa: string | null;
  setFavoriteMensa: (name: string | null) => void;
  isLoggedIn: boolean;
  authUser: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
  priceMultiplier: number;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  matrikel: string;
  campus: string;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [favoriteMensa, setFavoriteMensaState] = useState<string | null>(
    () => localStorage.getItem("favoriteMensa")
  );
  const [authUser, setAuthUserState] = useState<AuthUser | null>(null);
  const [preferences, setPreferencesState] = useState<UserPreferences>(
    () => {
      try { return JSON.parse(localStorage.getItem("preferences") ?? "null") ?? { dietary: [], allergens: [] }; }
      catch { return { dietary: [], allergens: [] }; }
    }
  );

  const setFavoriteMensa = (name: string | null) => {
    setFavoriteMensaState(name);
    if (name) localStorage.setItem("favoriteMensa", name);
    else localStorage.removeItem("favoriteMensa");
  };

  const setAuthUser = (user: AuthUser | null) => {
    setAuthUserState(user);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem(TOKEN_KEY, res.token);
      const user: AuthUser = {
        firstName: res.user.firstName || "",
        lastName: res.user.lastName || "",
        email: res.user.email,
        campus: email.includes("fh") ? "FH Dortmund" : "TU Dortmund",
        matrikel: "",
        type: (res.user.type as UserType) || "student",
      };
      setAuthUser(user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Login fehlgeschlagen" };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.register(data);
      localStorage.setItem(TOKEN_KEY, res.token);
      const user: AuthUser = {
        firstName: res.user.firstName || data.firstName,
        lastName: res.user.lastName || data.lastName,
        email: res.user.email,
        campus: data.campus,
        matrikel: data.matrikel,
        type: (res.user.type as UserType) || "student",
      };
      setAuthUser(user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Registrierung fehlgeschlagen" };
    }
  };

  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const saved = localStorage.getItem(USER_KEY);
    if (token && saved) {
      try { setAuthUserState(JSON.parse(saved)); } catch {}
      // Silently refresh from server
      authApi.me().then(u => {
        setAuthUserState({
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email,
          campus: "",
          matrikel: "",
          type: (u.type as UserType) || "student",
        });
      }).catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      });
    }
  }, []);

  const setPreferences = (p: UserPreferences) => {
    setPreferencesState(p);
    localStorage.setItem("preferences", JSON.stringify(p));
  };

  const isLoggedIn = authUser !== null;
  const priceMultiplier = !isLoggedIn ? 2.0 : authUser!.type === "student" ? 1.0 : authUser!.type === "staff" ? 1.5 : 2.0;

  return (
    <UserContext.Provider value={{
      favoriteMensa, setFavoriteMensa,
      isLoggedIn, authUser, login, register, logout,
      preferences, setPreferences,
      priceMultiplier,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
