import { Router } from "express";
import { ordersDb } from "../db.ts";
import { requireAuth, type AuthRequest } from "../middleware/auth.ts";
import { randomUUID } from "crypto";

export const ordersRouter = Router();

// All order routes require auth
ordersRouter.use(requireAuth);

// GET /api/orders — eigene Bestellungen
ordersRouter.get("/", (req: AuthRequest, res) => {
  res.json(ordersDb.byUser(req.userId!));
});

// POST /api/orders — neue Bestellung
ordersRouter.post("/", (req: AuthRequest, res) => {
  const { items, total, pickupTime, location, paymentMethod, code } = req.body;
  if (!items || !total || !pickupTime || !code) {
    res.status(400).json({ error: "Fehlende Felder" });
    return;
  }
  const order = ordersDb.add({
    id: randomUUID(),
    userId: req.userId!,
    code,
    items,
    total,
    pickupTime,
    location: location ?? "Mensa",
    paymentMethod: paymentMethod ?? "Karte",
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(order);
});

// PATCH /api/orders/:id — Status ändern (z.B. collected)
ordersRouter.patch("/:id", (req: AuthRequest, res) => {
  const updated = ordersDb.update(req.params.id, { status: req.body.status });
  if (!updated) { res.status(404).json({ error: "Bestellung nicht gefunden" }); return; }
  res.json(updated);
});
