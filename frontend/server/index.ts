import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.ts";
import { menuRouter } from "./routes/menu.ts";
import { ordersRouter } from "./routes/orders.ts";
import { votesRouter } from "./routes/votes.ts";
import { mensasRouter } from "./routes/mensas.ts";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/menu", menuRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/votes", votesRouter);
app.use("/api/mensas", mensasRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Mensen-App Server läuft auf http://localhost:${PORT}`);
});
