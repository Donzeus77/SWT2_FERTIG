import { Router } from "express";

export const mensasRouter = Router();

const MENSAS = [
  { id: "hauptmensa", name: "Hauptmensa", campus: "TU Dortmund", address: "Vogelpothsweg 85, 44227 Dortmund", hours: "Mo–Fr 11:15–14:15", occupancy: "medium", mapsUrl: "https://maps.google.com/?q=Hauptmensa+TU+Dortmund" },
  { id: "food-fakultaet", name: "food fakultät", campus: "TU Dortmund", address: "Emil-Figge-Str. 42, 44227 Dortmund", hours: "Mo–Fr 11:15–14:15", occupancy: "low", mapsUrl: "https://maps.google.com/?q=food+fakult%C3%A4t+TU+Dortmund" },
  { id: "galerie", name: "Galerie", campus: "TU Dortmund", address: "Vogelpothsweg 85, 44227 Dortmund", hours: "Mo–Fr 11:15–14:15", occupancy: "low", mapsUrl: "https://maps.google.com/?q=Galerie+Mensa+TU+Dortmund" },
  { id: "mensa-sued", name: "Mensa Süd", campus: "TU Dortmund", address: "August-Schmidt-Str. 2, 44227 Dortmund", hours: "Mo–Fr 11:15–14:15", occupancy: "medium", mapsUrl: "https://maps.google.com/?q=Mensa+S%C3%BCd+TU+Dortmund" },
  { id: "archeteria", name: "Archeteria", campus: "TU Dortmund", address: "August-Schmidt-Str. 2, 44227 Dortmund", hours: "Mo–Fr 08:00–16:30", occupancy: "high", mapsUrl: "https://maps.google.com/?q=Archeteria+TU+Dortmund" },
  { id: "kostbar", name: "Mensa kostBar", campus: "FH Dortmund", address: "Emil-Figge-Str. 40, 44227 Dortmund", hours: "Mo–Fr 11:30–14:00", occupancy: "low", mapsUrl: "https://maps.google.com/?q=Mensa+kostBar+FH+Dortmund" },
  { id: "max-ophuels", name: "Max-Ophüls-Platz", campus: "FH Dortmund", address: "Max-Ophüls-Platz 2, 44139 Dortmund", hours: "Mo–Fr 11:30–14:00", occupancy: "low", mapsUrl: "https://maps.google.com/?q=FH+Dortmund+Max-Oph%C3%BCls-Platz" },
  { id: "sonnenstrasse", name: "Mensa Sonnenstraße", campus: "FH Dortmund", address: "Sonnenstr. 100, 44139 Dortmund", hours: "Mo–Fr 11:30–14:00", occupancy: "low", mapsUrl: "https://maps.google.com/?q=Mensa+Sonnenstra%C3%9Fe+Dortmund" },
];

// GET /api/mensas
mensasRouter.get("/", (_req, res) => res.json(MENSAS));

// GET /api/mensas/:id
mensasRouter.get("/:id", (req, res) => {
  const mensa = MENSAS.find((m) => m.id === req.params.id);
  if (!mensa) { res.status(404).json({ error: "Mensa nicht gefunden" }); return; }
  res.json(mensa);
});
