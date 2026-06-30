import { Router } from "express";
import { votesDb } from "../db.ts";
import { requireAuth, type AuthRequest } from "../middleware/auth.ts";

export const votesRouter = Router();

// GET /api/votes — Stimmenanzahl (öffentlich)
votesRouter.get("/", (_req, res) => {
  res.json(votesDb.counts());
});

// GET /api/votes/my — eigene Stimmen (Auth)
votesRouter.get("/my", requireAuth, (req: AuthRequest, res) => {
  res.json(votesDb.votedByUser(req.userId!));
});

// POST /api/votes/:dishId — abstimmen (Auth)
votesRouter.post("/:dishId", requireAuth, (req: AuthRequest, res) => {
  const { dishId } = req.params;
  const alreadyVoted = votesDb.votedByUser(req.userId!);
  if (alreadyVoted.includes(dishId)) {
    res.status(409).json({ error: "Bereits abgestimmt" });
    return;
  }
  const counts = votesDb.cast(req.userId!, dishId);
  res.json({ counts, votedIds: [...alreadyVoted, dishId] });
});
