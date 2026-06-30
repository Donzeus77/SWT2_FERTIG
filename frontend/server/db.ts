// Simple JSON-file database — no external DB server needed.
// Swap this file for a real DB adapter (postgres, mysql, sqlite) later
// without touching any route code.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dir, "data");

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR);

function filePath(name: string) {
  return join(DATA_DIR, `${name}.json`);
}

function read<T>(name: string, fallback: T): T {
  const fp = filePath(name);
  if (!existsSync(fp)) return fallback;
  try { return JSON.parse(readFileSync(fp, "utf8")); }
  catch { return fallback; }
}

function write(name: string, data: unknown) {
  writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf8");
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  campus: string;
  matrikel: string;
  type: "student" | "staff" | "guest";
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  code: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  pickupTime: string;
  location: string;
  paymentMethod: string;
  status: "pending" | "ready" | "collected";
  createdAt: string;
}

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

// ── Collections ──────────────────────────────────────────────────────────────

export const usersDb = {
  all: (): User[] => read("users", []),
  findByEmail: (email: string) => read<User[]>("users", []).find((u) => u.email === email.toLowerCase()),
  findById: (id: string) => read<User[]>("users", []).find((u) => u.id === id),
  add: (user: User) => {
    const list = read<User[]>("users", []);
    list.push(user);
    write("users", list);
    return user;
  },
};

export const ordersDb = {
  all: (): Order[] => read("orders", []),
  byUser: (userId: string): Order[] => read<Order[]>("orders", []).filter((o) => o.userId === userId),
  add: (order: Order) => {
    const list = read<Order[]>("orders", []);
    list.push(order);
    write("orders", list);
    return order;
  },
  update: (id: string, patch: Partial<Order>) => {
    const list = read<Order[]>("orders", []);
    const idx = list.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    write("orders", list);
    return list[idx];
  },
};

export const votesDb = {
  counts: (): Record<string, number> => read("votes", {}),
  votedByUser: (userId: string): string[] => (read<Record<string, string[]>>("votedBy", {}))[userId] ?? [],
  cast: (userId: string, dishId: string) => {
    const counts = read<Record<string, number>>("votes", {});
    counts[dishId] = (counts[dishId] ?? 0) + 1;
    write("votes", counts);
    const byUser = read<Record<string, string[]>>("votedBy", {});
    byUser[userId] = [...(byUser[userId] ?? []), dishId];
    write("votedBy", byUser);
    return counts;
  },
};

export const menuDb = {
  byDate: (date: string): MenuItem[] => {
    const all = read<Record<string, MenuItem[]>>("menu", {});
    return all[date] ?? [];
  },
  setDate: (date: string, items: MenuItem[]) => {
    const all = read<Record<string, MenuItem[]>>("menu", {});
    all[date] = items;
    write("menu", all);
  },
};
