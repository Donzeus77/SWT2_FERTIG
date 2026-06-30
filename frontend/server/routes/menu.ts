import { Router } from "express";
import { menuDb } from "../db.ts";
import { generateMenuForDate } from "../seed/menuSeed.ts";

export const menuRouter = Router();

// GET /api/menu/:date  (date = YYYY-MM-DD)
menuRouter.get("/:date", (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "Ungültiges Datumsformat (YYYY-MM-DD)" });
    return;
  }

  let items = menuDb.byDate(date);

  // Auto-generate if not in DB yet (covers weekdays ±14 days)
  if (items.length === 0) {
    const d = new Date(date);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) {
      res.json({ date, items: [] });
      return;
    }
    items = generateMenuForDate(date);
    menuDb.setDate(date, items);
  }

  res.json({ date, items });
});

// GET /api/menu/week/:monday  — returns Mon–Fri
menuRouter.get("/week/:monday", (req, res) => {
  const { monday } = req.params;
  const start = new Date(monday);
  const week: Record<string, unknown> = {};

  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    let items = menuDb.byDate(dateStr);
    if (items.length === 0) {
      items = generateMenuForDate(dateStr);
      menuDb.setDate(dateStr, items);
    }
    week[dateStr] = items;
  }

  res.json(week);
});
