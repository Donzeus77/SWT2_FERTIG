import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ordersApi, type Order as ApiOrder } from "../lib/api";

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
  addOrder: (order: Omit<Order, "id" | "createdAt">) => Promise<Order | null>;
  markCollected: (id: string) => void;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | null>(null);

function mapOrder(o: ApiOrder): Order {
  return {
    id: String(o.id),
    code: o.code || "",
    items: (o.items || []).map((i: any) => ({
      name: i.name || "", quantity: i.quantity || 1, price: i.price || 0,
    })),
    total: o.total || 0,
    pickupTime: o.pickupTime || "",
    location: o.location || "",
    paymentMethod: o.paymentMethod || "",
    createdAt: o.createdAt || "",
    status: (o.status as Order["status"]) || "pending",
  };
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ordersApi.list()
      .then((data: ApiOrder[]) => setOrders(data.map(mapOrder)))
      .catch(() => {});
  }, []);

  const addOrder = async (order: Omit<Order, "id" | "createdAt">): Promise<Order | null> => {
    try {
      const created = await ordersApi.create(order as any);
      const mapped = mapOrder(created);
      setOrders(prev => [mapped, ...prev]);
      return mapped;
    } catch {
      return null;
    }
  };

  const markCollected = (id: string) => {
    ordersApi.updateStatus(id, "collected").then(() => {
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "collected" as const } : o));
    }).catch(() => {});
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, markCollected, loading }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
