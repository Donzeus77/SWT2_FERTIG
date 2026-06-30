import type { MenuItem } from "../db.ts";

const LOCATIONS = [
  "Hauptmensa (TU Campus Nord)",
  "food fakultät (TU Campus Nord)",
  "Galerie (TU Campus Nord)",
  "Mensa Süd (TU Campus Süd)",
  "Archeteria (TU Campus Süd)",
  "Mensa kostBar (FH Dortmund)",
];

const POOL: Omit<MenuItem, "id" | "location">[] = [
  { name: "Spaghetti Bolognese", description: "Klassische Bolognese mit Rinderhackfleisch", category: "hauptgericht", studentPrice: 4.50, staffPrice: 6.00, guestPrice: 8.50, allergens: ["Gluten", "Sellerie"], dietary: [], nutrition: { calories: 650, protein: 28, carbs: 85, fat: 18 }, available: true },
  { name: "Gemüsecurry mit Reis", description: "Cremiges Curry mit Kichererbsen und Kokosmilch", category: "hauptgericht", studentPrice: 3.90, staffPrice: 5.50, guestPrice: 7.50, allergens: [], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 520, protein: 15, carbs: 72, fat: 14 }, available: true },
  { name: "Hähnchenschnitzel", description: "Paniertes Hähnchenschnitzel mit Pommes", category: "hauptgericht", studentPrice: 5.20, staffPrice: 6.80, guestPrice: 9.00, allergens: ["Gluten", "Ei"], dietary: ["Halal"], nutrition: { calories: 780, protein: 42, carbs: 65, fat: 32 }, available: true },
  { name: "Vegane Lasagne", description: "Lasagne mit Gemüse und veganer Béchamel", category: "hauptgericht", studentPrice: 4.80, staffPrice: 6.30, guestPrice: 8.50, allergens: ["Gluten", "Soja"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 480, protein: 18, carbs: 58, fat: 16 }, available: true },
  { name: "Pizza Margherita", description: "Klassische Pizza mit Tomatensauce und Mozzarella", category: "hauptgericht", studentPrice: 3.50, staffPrice: 5.00, guestPrice: 7.00, allergens: ["Gluten", "Milch"], dietary: ["Vegetarisch"], nutrition: { calories: 620, protein: 24, carbs: 78, fat: 22 }, available: true },
  { name: "Rindergulasch", description: "Ungarisches Rindergulasch mit Kartoffeln", category: "hauptgericht", studentPrice: 5.50, staffPrice: 7.00, guestPrice: 9.50, allergens: ["Sellerie"], dietary: [], nutrition: { calories: 720, protein: 38, carbs: 45, fat: 35 }, available: true },
  { name: "Thai-Gemüsepfanne", description: "Asiatische Gemüsepfanne mit Erdnusssauce", category: "hauptgericht", studentPrice: 4.20, staffPrice: 5.80, guestPrice: 8.00, allergens: ["Erdnuss", "Soja"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 540, protein: 16, carbs: 75, fat: 18 }, available: true },
  { name: "Pasta Carbonara", description: "Cremige Pasta mit Speck und Parmesan", category: "hauptgericht", studentPrice: 4.30, staffPrice: 5.90, guestPrice: 8.00, allergens: ["Gluten", "Milch", "Ei"], dietary: [], nutrition: { calories: 680, protein: 26, carbs: 72, fat: 28 }, available: true },
  { name: "Falafel Bowl", description: "Falafel mit Hummus, Tabouleh und Tahini", category: "hauptgericht", studentPrice: 4.30, staffPrice: 5.80, guestPrice: 8.00, allergens: ["Sesam", "Gluten"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 580, protein: 22, carbs: 68, fat: 24 }, available: true },
  { name: "Lachsfilet", description: "Gebratenes Lachsfilet mit Dillkartoffeln", category: "hauptgericht", studentPrice: 5.90, staffPrice: 7.50, guestPrice: 10.50, allergens: ["Fisch"], dietary: [], nutrition: { calories: 610, protein: 45, carbs: 32, fat: 28 }, available: true },
  { name: "Kartoffelsuppe", description: "Cremige Kartoffelsuppe mit Würstchen", category: "beilage", studentPrice: 2.50, staffPrice: 3.50, guestPrice: 5.00, allergens: ["Sellerie", "Senf"], dietary: [], nutrition: { calories: 320, protein: 12, carbs: 38, fat: 14 }, available: true },
  { name: "Bunter Salatteller", description: "Gemischter Salat mit Balsamico-Dressing", category: "beilage", studentPrice: 2.90, staffPrice: 3.90, guestPrice: 5.50, allergens: ["Senf"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 180, protein: 4, carbs: 12, fat: 8 }, available: true },
  { name: "Apfelstrudel", description: "Warmer Apfelstrudel mit Vanillesauce", category: "beilage", studentPrice: 2.20, staffPrice: 3.00, guestPrice: 4.50, allergens: ["Gluten", "Milch"], dietary: ["Vegetarisch"], nutrition: { calories: 310, protein: 4, carbs: 52, fat: 10 }, available: true },
  { name: "Linseneintopf", description: "Herzhafter Linseneintopf mit Gemüse", category: "beilage", studentPrice: 2.80, staffPrice: 3.80, guestPrice: 5.50, allergens: ["Sellerie"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 340, protein: 18, carbs: 52, fat: 6 }, available: true },
];

export function generateMenuForDate(dateStr: string): MenuItem[] {
  const seed = dateStr.split("-").reduce((s, n) => s + parseInt(n), 0);
  const items: MenuItem[] = [];
  const mainPool = POOL.filter((i) => i.category === "hauptgericht");
  const sidePool = POOL.filter((i) => i.category === "beilage");
  let idCounter = seed * 100;

  LOCATIONS.forEach((location, li) => {
    for (let m = 0; m < 2; m++) {
      const item = mainPool[(seed + li * 3 + m) % mainPool.length];
      items.push({ ...item, id: `${dateStr}-${++idCounter}`, location });
    }
    const side = sidePool[(seed + li) % sidePool.length];
    items.push({ ...side, id: `${dateStr}-${++idCounter}`, location });
  });

  return items;
}
