import { Router } from "express";
import bcrypt from "bcryptjs";
import { usersDb } from "../db.ts";
import { signToken, requireAuth, type AuthRequest } from "../middleware/auth.ts";
import { randomUUID } from "crypto";

export const authRouter = Router();

const VALID_DOMAINS = ["stud.tu-dortmund.de", "stud.fh-dortmund.de", "tu-dortmund.de", "fh-dortmund.de"];
const isValidUniEmail = (e: string) => VALID_DOMAINS.some((d) => e.toLowerCase().endsWith("@" + d));

// POST /api/auth/register
authRouter.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, matrikel, campus } = req.body;

  if (!firstName || !lastName || !email || !password || !matrikel) {
    res.status(400).json({ error: "Alle Felder erforderlich" });
    return;
  }
  if (!isValidUniEmail(email)) {
    res.status(400).json({ error: "Nur Uni-E-Mail-Adressen erlaubt" });
    return;
  }
  if (usersDb.findByEmail(email)) {
    res.status(409).json({ error: "E-Mail bereits registriert" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = usersDb.add({
    id: randomUUID(),
    firstName,
    lastName,
    email: email.toLowerCase(),
    passwordHash,
    campus: campus ?? "TU Dortmund",
    matrikel,
    type: "student",
    createdAt: new Date().toISOString(),
  });

  const token = signToken(user.id, user.type);
  res.status(201).json({
    token,
    user: { id: user.id, firstName, lastName, email: user.email, campus: user.campus, matrikel, type: user.type },
  });
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = usersDb.findByEmail(email);

  if (!user) { res.status(401).json({ error: "E-Mail oder Passwort falsch" }); return; }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) { res.status(401).json({ error: "E-Mail oder Passwort falsch" }); return; }

  const token = signToken(user.id, user.type);
  res.json({
    token,
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, campus: user.campus, matrikel: user.matrikel, type: user.type },
  });
});

// GET /api/auth/me
authRouter.get("/me", requireAuth, (req: AuthRequest, res) => {
  const user = usersDb.findById(req.userId!);
  if (!user) { res.status(404).json({ error: "Nutzer nicht gefunden" }); return; }
  const { passwordHash: _, ...safe } = user;
  res.json(safe);
});
