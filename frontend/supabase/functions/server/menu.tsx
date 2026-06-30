import * as kv from "./kv_store.tsx";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: "hauptgericht" | "beilage" | "suppe" | "dessert" | "salat";
  price: number;
  allergens: string[];
  dietary: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  available: boolean;
  location: string;
  image?: string;
}

export interface DailyMenu {
  date: string;
  items: MenuItem[];
}

// Initialize sample menu data
export async function initializeMenuData() {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const menuToday: DailyMenu = {
    date: today,
    items: [
      {
        id: "1",
        name: "Spaghetti Bolognese",
        description: "Klassische Bolognese mit Rinderhackfleisch und Tomatensauce",
        category: "hauptgericht",
        price: 4.5,
        allergens: ["Gluten", "Sellerie"],
        dietary: [],
        nutrition: { calories: 650, protein: 28, carbs: 85, fat: 18 },
        available: true,
        location: "Hauptmensa (TU Campus Nord)",
      },
      {
        id: "2",
        name: "Gemüsecurry mit Reis",
        description: "Cremiges Curry mit Kichererbsen, Paprika und Kokosmilch",
        category: "hauptgericht",
        price: 3.9,
        allergens: [],
        dietary: ["Vegan", "Vegetarisch"],
        nutrition: { calories: 520, protein: 15, carbs: 72, fat: 14 },
        available: true,
        location: "Hauptmensa (TU Campus Nord)",
      },
      {
        id: "3",
        name: "Hähnchenschnitzel",
        description: "Paniertes Hähnchenschnitzel mit Pommes Frites",
        category: "hauptgericht",
        price: 5.2,
        allergens: ["Gluten", "Ei"],
        dietary: ["Halal"],
        nutrition: { calories: 780, protein: 42, carbs: 65, fat: 32 },
        available: true,
        location: "Mensa Süd (TU Campus Süd)",
      },
      {
        id: "4",
        name: "Vegane Lasagne",
        description: "Lasagne mit Gemüse und veganer Béchamelsauce",
        category: "hauptgericht",
        price: 4.8,
        allergens: ["Gluten", "Soja"],
        dietary: ["Vegan", "Vegetarisch"],
        nutrition: { calories: 480, protein: 18, carbs: 58, fat: 16 },
        available: true,
        location: "food fakultät (TU Campus Nord)",
      },
      {
        id: "5",
        name: "Pizza Margherita",
        description: "Klassische Pizza mit Tomatensauce und Mozzarella",
        category: "hauptgericht",
        price: 3.5,
        allergens: ["Gluten", "Milch"],
        dietary: ["Vegetarisch"],
        nutrition: { calories: 620, protein: 24, carbs: 78, fat: 22 },
        available: true,
        location: "food fakultät (TU Campus Nord)",
      },
      {
        id: "6",
        name: "Kartoffelsuppe",
        description: "Cremige Kartoffelsuppe mit Würstchen",
        category: "suppe",
        price: 2.5,
        allergens: ["Sellerie", "Senf"],
        dietary: [],
        nutrition: { calories: 320, protein: 12, carbs: 38, fat: 14 },
        available: true,
        location: "Archeteria (TU Campus Süd)",
      },
      {
        id: "7",
        name: "Bunter Salatteller",
        description: "Gemischter Salat mit Balsamico-Dressing",
        category: "salat",
        price: 2.9,
        allergens: ["Senf"],
        dietary: ["Vegan", "Vegetarisch"],
        nutrition: { calories: 180, protein: 4, carbs: 12, fat: 8 },
        available: true,
        location: "Alle Standorte",
      },
      {
        id: "8",
        name: "Schokoladenpudding",
        description: "Cremiger Schokoladenpudding mit Sahne",
        category: "dessert",
        price: 1.5,
        allergens: ["Milch"],
        dietary: ["Vegetarisch"],
        nutrition: { calories: 220, protein: 5, carbs: 32, fat: 8 },
        available: true,
        location: "Alle Standorte",
      },
      {
        id: "9",
        name: "Falafel Bowl",
        description: "Falafel mit Hummus, Tabouleh und Tahini-Sauce",
        category: "hauptgericht",
        price: 4.3,
        allergens: ["Sesam", "Gluten"],
        dietary: ["Vegan", "Vegetarisch"],
        nutrition: { calories: 580, protein: 22, carbs: 68, fat: 24 },
        available: true,
        location: "Mensa kostBar (FH Dortmund)",
      },
      {
        id: "10",
        name: "Linseneintopf",
        description: "Herzhafter Linseneintopf mit Gemüse",
        category: "suppe",
        price: 2.8,
        allergens: ["Sellerie"],
        dietary: ["Vegan", "Vegetarisch"],
        nutrition: { calories: 340, protein: 18, carbs: 52, fat: 6 },
        available: true,
        location: "Galerie (TU Campus Nord)",
      },
    ],
  };

  const menuTomorrow: DailyMenu = {
    date: tomorrow,
    items: [
      {
        id: "11",
        name: "Rindergulasch",
        description: "Ungarisches Rindergulasch mit Kartoffeln",
        category: "hauptgericht",
        price: 5.5,
        allergens: ["Sellerie"],
        dietary: [],
        nutrition: { calories: 720, protein: 38, carbs: 45, fat: 35 },
        available: true,
        location: "Hauptmensa (TU Campus Nord)",
      },
      {
        id: "12",
        name: "Thai-Gemüsepfanne",
        description: "Asiatische Gemüsepfanne mit Erdnusssauce und Reis",
        category: "hauptgericht",
        price: 4.2,
        allergens: ["Erdnuss", "Soja"],
        dietary: ["Vegan", "Vegetarisch"],
        nutrition: { calories: 540, protein: 16, carbs: 75, fat: 18 },
        available: true,
        location: "food fakultät (TU Campus Nord)",
      },
      {
        id: "13",
        name: "Pasta Carbonara",
        description: "Cremige Pasta mit Speck und Parmesan",
        category: "hauptgericht",
        price: 4.3,
        allergens: ["Gluten", "Milch", "Ei"],
        dietary: [],
        nutrition: { calories: 680, protein: 26, carbs: 72, fat: 28 },
        available: true,
        location: "Mensa Süd (TU Campus Süd)",
      },
    ],
  };

  await kv.set(`menu:${today}`, menuToday);
  await kv.set(`menu:${tomorrow}`, menuTomorrow);
}

export async function getMenuByDate(date: string): Promise<DailyMenu | null> {
  return await kv.get(`menu:${date}`);
}

export async function getAllMenus(): Promise<DailyMenu[]> {
  const menus = await kv.getByPrefix("menu:");
  return menus;
}
