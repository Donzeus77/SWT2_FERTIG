export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: "hauptgericht" | "beilage";
  price: number;
  allergens: string[];
  dietary: string[];
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
  available: boolean;
  location: string;
}

export interface DailyMenu {
  date: string;
  items: MenuItem[];
}

const LOCATIONS = [
  "Hauptmensa (TU Campus Nord)",
  "food fakultät (TU Campus Nord)",
  "Galerie (TU Campus Nord)",
  "Mensa Süd (TU Campus Süd)",
  "Archeteria (TU Campus Süd)",
  "Mensa kostBar (FH Dortmund)",
];

const MENU_POOL: Omit<MenuItem, "id" | "location">[] = [
  { name: "Spaghetti Bolognese", description: "Klassische Bolognese mit Rinderhackfleisch und Tomatensauce", category: "hauptgericht", price: 4.50, allergens: ["Gluten", "Sellerie"], dietary: [], nutrition: { calories: 650, protein: 28, carbs: 85, fat: 18 }, available: true },
  { name: "Gemüsecurry mit Reis", description: "Cremiges Curry mit Kichererbsen, Paprika und Kokosmilch", category: "hauptgericht", price: 3.90, allergens: [], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 520, protein: 15, carbs: 72, fat: 14 }, available: true },
  { name: "Hähnchenschnitzel", description: "Paniertes Hähnchenschnitzel mit Pommes Frites", category: "hauptgericht", price: 5.20, allergens: ["Gluten", "Ei"], dietary: ["Halal"], nutrition: { calories: 780, protein: 42, carbs: 65, fat: 32 }, available: true },
  { name: "Vegane Lasagne", description: "Lasagne mit Gemüse und veganer Béchamelsauce", category: "hauptgericht", price: 4.80, allergens: ["Gluten", "Soja"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 480, protein: 18, carbs: 58, fat: 16 }, available: true },
  { name: "Pizza Margherita", description: "Klassische Pizza mit Tomatensauce und Mozzarella", category: "hauptgericht", price: 3.50, allergens: ["Gluten", "Milch"], dietary: ["Vegetarisch"], nutrition: { calories: 620, protein: 24, carbs: 78, fat: 22 }, available: true },
  { name: "Rindergulasch", description: "Ungarisches Rindergulasch mit Kartoffeln", category: "hauptgericht", price: 5.50, allergens: ["Sellerie"], dietary: [], nutrition: { calories: 720, protein: 38, carbs: 45, fat: 35 }, available: true },
  { name: "Thai-Gemüsepfanne", description: "Asiatische Gemüsepfanne mit Erdnusssauce und Reis", category: "hauptgericht", price: 4.20, allergens: ["Erdnuss", "Soja"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 540, protein: 16, carbs: 75, fat: 18 }, available: true },
  { name: "Pasta Carbonara", description: "Cremige Pasta mit Speck und Parmesan", category: "hauptgericht", price: 4.30, allergens: ["Gluten", "Milch", "Ei"], dietary: [], nutrition: { calories: 680, protein: 26, carbs: 72, fat: 28 }, available: true },
  { name: "Falafel Bowl", description: "Falafel mit Hummus, Tabouleh und Tahini-Sauce", category: "hauptgericht", price: 4.30, allergens: ["Sesam", "Gluten"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 580, protein: 22, carbs: 68, fat: 24 }, available: true },
  { name: "Lachsfilet", description: "Gebratenes Lachsfilet mit Dillkartoffeln und Salatbeilage", category: "hauptgericht", price: 5.90, allergens: ["Fisch"], dietary: [], nutrition: { calories: 610, protein: 45, carbs: 32, fat: 28 }, available: true },
  { name: "Tofu-Stir-Fry", description: "Gebratener Tofu mit Brokkoli und Teriyaki-Sauce", category: "hauptgericht", price: 4.10, allergens: ["Soja", "Sesam"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 430, protein: 20, carbs: 48, fat: 16 }, available: true },
  { name: "Schweinebraten", description: "Bayerischer Schweinebraten mit Knödel und Soße", category: "hauptgericht", price: 5.30, allergens: ["Gluten", "Sellerie"], dietary: [], nutrition: { calories: 820, protein: 44, carbs: 62, fat: 38 }, available: true },
  { name: "Quiche Lorraine", description: "Herzhafte Quiche mit Speck, Ei und Gruyère", category: "hauptgericht", price: 4.00, allergens: ["Gluten", "Milch", "Ei"], dietary: [], nutrition: { calories: 540, protein: 20, carbs: 34, fat: 32 }, available: true },
  { name: "Veganer Burger", description: "Pflanzlicher Patty mit Avocado, Salat und Soße", category: "hauptgericht", price: 4.70, allergens: ["Gluten", "Soja"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 560, protein: 18, carbs: 62, fat: 24 }, available: true },
  { name: "Kartoffelsuppe", description: "Cremige Kartoffelsuppe mit Würstchen und Schnittlauch", category: "beilage", price: 2.50, allergens: ["Sellerie", "Senf"], dietary: [], nutrition: { calories: 320, protein: 12, carbs: 38, fat: 14 }, available: true },
  { name: "Bunter Salatteller", description: "Gemischter Salat mit Balsamico-Dressing", category: "beilage", price: 2.90, allergens: ["Senf"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 180, protein: 4, carbs: 12, fat: 8 }, available: true },
  { name: "Schokoladenpudding", description: "Cremiger Schokoladenpudding mit Sahne", category: "beilage", price: 1.50, allergens: ["Milch"], dietary: ["Vegetarisch"], nutrition: { calories: 220, protein: 5, carbs: 32, fat: 8 }, available: true },
  { name: "Linseneintopf", description: "Herzhafter Linseneintopf mit Gemüse", category: "beilage", price: 2.80, allergens: ["Sellerie"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 340, protein: 18, carbs: 52, fat: 6 }, available: true },
  { name: "Tomatensuppe", description: "Hausgemachte Tomatensuppe mit Basilikum", category: "beilage", price: 2.30, allergens: ["Sellerie"], dietary: ["Vegan", "Vegetarisch"], nutrition: { calories: 180, protein: 4, carbs: 28, fat: 5 }, available: true },
  { name: "Apfelstrudel", description: "Warmer Apfelstrudel mit Vanillesauce", category: "beilage", price: 2.20, allergens: ["Gluten", "Milch"], dietary: ["Vegetarisch"], nutrition: { calories: 310, protein: 4, carbs: 52, fat: 10 }, available: true },
];

// Distribute pool items across locations for a given day
function buildDayMenu(dateStr: string, seed: number): DailyMenu {
  const items: MenuItem[] = [];
  let id = seed * 100;

  // Each location gets 2-3 hauptgerichte and 1-2 beilagen
  LOCATIONS.forEach((location, li) => {
    const mainOffset = (seed + li * 3) % MENU_POOL.filter(i => i.category === "hauptgericht").length;
    const mainItems = MENU_POOL.filter(i => i.category === "hauptgericht");
    const sideItems = MENU_POOL.filter(i => i.category === "beilage");

    // 2 main dishes per location
    for (let m = 0; m < 2; m++) {
      const item = mainItems[(mainOffset + m) % mainItems.length];
      items.push({ ...item, id: String(++id), location });
    }
    // 1 side per location (shared)
    const sideItem = sideItems[(seed + li) % sideItems.length];
    items.push({ ...sideItem, id: String(++id), location });
  });

  return { date: dateStr, items };
}

// Generate current week Mon–Fri + next week
export const mockMenuData: Record<string, DailyMenu> = {};

const today = new Date();
for (let offset = -7; offset <= 14; offset++) {
  const d = new Date(today);
  d.setDate(today.getDate() + offset);
  const dow = d.getDay();
  if (dow === 0 || dow === 6) continue; // skip weekends
  const dateStr = d.toISOString().split("T")[0];
  const seed = Math.abs(offset + 7);
  mockMenuData[dateStr] = buildDayMenu(dateStr, seed);
}

export function getMenuByDate(date: string): DailyMenu | null {
  return mockMenuData[date] ?? null;
}

export function getWeekDates(referenceDate: Date): string[] {
  const dates: string[] = [];
  const d = new Date(referenceDate);
  // Go to Monday of the week
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  for (let i = 0; i < 5; i++) {
    dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}
