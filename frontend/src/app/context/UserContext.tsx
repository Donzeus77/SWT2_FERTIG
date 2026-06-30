import { createContext, useContext, useState, ReactNode } from "react";

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

interface UserContextType {
  favoriteMensa: string | null;
  setFavoriteMensa: (name: string | null) => void;
  isLoggedIn: boolean;
  authUser: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
  discountRate: number;
  priceMultiplier: number;
}

const UserContext = createContext<UserContextType | null>(null);

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; }
  catch { return fallback; }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [favoriteMensa, setFavoriteMensaState] = useState<string | null>(
    () => localStorage.getItem("favoriteMensa")
  );
  const [authUser, setAuthUser] = useState<AuthUser | null>(
    () => load<AuthUser | null>("authUser", null)
  );
  const [preferences, setPreferencesState] = useState<UserPreferences>(
    () => load<UserPreferences>("preferences", { dietary: [], allergens: [] })
  );

  const setFavoriteMensa = (name: string | null) => {
    setFavoriteMensaState(name);
    if (name) localStorage.setItem("favoriteMensa", name);
    else localStorage.removeItem("favoriteMensa");
  };

  const login = (user: AuthUser) => {
    setAuthUser(user);
    localStorage.setItem("authUser", JSON.stringify(user));
  };

  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem("authUser");
  };

  const setPreferences = (p: UserPreferences) => {
    setPreferencesState(p);
    localStorage.setItem("preferences", JSON.stringify(p));
  };

  const isLoggedIn = authUser !== null;
  // Price multiplier relative to student base price
  const priceMultiplier = !isLoggedIn ? 2.0 : authUser!.type === "student" ? 1.0 : authUser!.type === "staff" ? 1.5 : 2.0;
  const discountRate = 0; // kept for compatibility, unused

  return (
    <UserContext.Provider value={{
      favoriteMensa, setFavoriteMensa,
      isLoggedIn, authUser, login, logout,
      preferences, setPreferences,
      discountRate,
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
