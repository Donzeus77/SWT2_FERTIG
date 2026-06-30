// Central API client — points at the Express backend.
// Falls back to mock data automatically when the server is unreachable.

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

function getToken(): string | null {
  return localStorage.getItem("authToken");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Serverfehler");
  }
  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  campus: string;
  matrikel: string;
  type: "student" | "staff" | "guest";
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    firstName: string; lastName: string; email: string;
    password: string; matrikel: string; campus: string;
  }) =>
    request<{ token: string; user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request<AuthUser>("/auth/me"),
};

// ── Menu ─────────────────────────────────────────────────────────────────────

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: "hauptgericht" | "beilage";
  studentPrice: number;
  staffPrice: number;
  guestPrice: number;
  allergens: string[];
  dietary: string[];
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
  location: string;
  available: boolean;
}

export const menuApi = {
  byDate: (date: string) =>
    request<{ date: string; items: MenuItem[] }>(`/menu/${date}`),

  byWeek: (monday: string) =>
    request<Record<string, MenuItem[]>>(`/menu/week/${monday}`),
};

// ── Orders ───────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  code: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  pickupTime: string;
  location: string;
  paymentMethod: string;
  status: "pending" | "ready" | "collected";
  createdAt: string;
}

export const ordersApi = {
  list: () => request<Order[]>("/orders"),

  create: (order: Omit<Order, "id" | "createdAt" | "userId">) =>
    request<Order>("/orders", { method: "POST", body: JSON.stringify(order) }),

  updateStatus: (id: string, status: Order["status"]) =>
    request<Order>(`/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// ── Votes ────────────────────────────────────────────────────────────────────

export const votesApi = {
  counts: () => request<Record<string, number>>("/votes"),
  myVotes: () => request<string[]>("/votes/my"),
  cast: (dishId: string) =>
    request<{ counts: Record<string, number>; votedIds: string[] }>(`/votes/${dishId}`, { method: "POST" }),
};

// ── Health check ─────────────────────────────────────────────────────────────

export async function isServerAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
