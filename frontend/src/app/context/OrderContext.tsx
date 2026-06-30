import { createContext, useContext, useState, ReactNode } from "react";

export interface Order {
  id: string;
  code: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  pickupTime: string;
  location: string;
  paymentMethod: string;
  createdAt: string;
  status: "pending" | "ready" | "collected";
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void;
  markCollected: (id: string) => void;
}

const OrderContext = createContext<OrderContextType | null>(null);

function loadOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem("orders") ?? "[]");
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  const addOrder = (order: Omit<Order, "id" | "createdAt">) => {
    const full: Order = {
      ...order,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => {
      const next = [full, ...prev];
      saveOrders(next);
      return next;
    });
  };

  const markCollected = (id: string) => {
    setOrders((prev) => {
      const next = prev.map((o) => o.id === id ? { ...o, status: "collected" as const } : o);
      saveOrders(next);
      return next;
    });
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, markCollected }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
