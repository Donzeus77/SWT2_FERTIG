import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Leaf, Heart, Plus, Flame, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useUser, type UserType } from "../context/UserContext";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  allergens: string[];
  dietary: string[];
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
  available: boolean;
  location: string;
}

const allergenColors: Record<string, string> = {
  Gluten: "bg-amber-100 text-amber-700",
  Milch: "bg-blue-100 text-blue-700",
  Ei: "bg-yellow-100 text-yellow-700",
  Nüsse: "bg-orange-100 text-orange-700",
  Erdnuss: "bg-orange-100 text-orange-700",
  Soja: "bg-green-100 text-green-700",
  Sellerie: "bg-lime-100 text-lime-700",
  Senf: "bg-yellow-100 text-yellow-800",
  Sesam: "bg-amber-100 text-amber-800",
  Fisch: "bg-cyan-100 text-cyan-700",
};

const dietaryIcons: Record<string, React.ReactNode> = {
  Vegan: <Leaf className="w-3 h-3" />,
  Vegetarisch: <Leaf className="w-3 h-3" />,
  Halal: <Heart className="w-3 h-3" />,
};

const PRICE_LABELS: Record<UserType | "guest", string> = {
  student: "Studierende",
  staff: "Bedienstete",
  guest: "Gäste",
};

export default function MenuCard({ item, highlight }: { item: MenuItem; highlight?: boolean }) {
  const { addItem } = useCart();
  const { isLoggedIn, authUser, priceMultiplier } = useUser();
  const [added, setAdded] = useState(false);

  const userType = isLoggedIn ? authUser!.type : "guest";
  const displayPrice = Math.round(item.price * priceMultiplier * 100) / 100;
  const priceLabel = PRICE_LABELS[userType];

  const handleAdd = () => {
    addItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: displayPrice,
      location: item.location,
      dietary: item.dietary,
      allergens: item.allergens,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
      highlight ? "border-[#003a70] shadow-md" : "border-gray-100"
    }`}>
      {highlight && (
        <div className="bg-[#003a70] text-white text-xs px-3 py-1 font-medium">
          ✦ Passend zu deinen Präferenzen
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-3">
            <h3 className="font-semibold text-base mb-0.5 text-gray-900" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
              {item.name}
            </h3>
            <p className="text-xs text-gray-500 mb-2">{item.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`text-base font-bold ${userType === "student" ? "text-[#003a70]" : userType === "staff" ? "text-orange-600" : "text-gray-700"}`}>
              {displayPrice.toFixed(2)} €
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{priceLabel}</div>
          </div>
        </div>

        {item.dietary.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.dietary.map((diet) => (
              <Badge key={diet} className="bg-green-100 text-green-700 hover:bg-green-100 text-xs gap-1">
                {dietaryIcons[diet]}{diet}
              </Badge>
            ))}
          </div>
        )}

        {item.allergens.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Allergene</p>
            <div className="flex flex-wrap gap-1">
              {item.allergens.map((allergen) => (
                <Badge key={allergen} variant="outline" className={`text-xs ${allergenColors[allergen] || "bg-gray-100 text-gray-700"}`}>
                  {allergen}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
          <div className="flex items-center gap-1"><Flame className="w-3 h-3" />{item.nutrition.calories} kcal</div>
          <div>E: {item.nutrition.protein}g</div>
          <div>K: {item.nutrition.carbs}g</div>
          <div>F: {item.nutrition.fat}g</div>
        </div>

        <Button
          onClick={handleAdd}
          className={`w-full h-9 text-sm transition-all duration-300 ${
            added ? "bg-green-600 hover:bg-green-600" : "bg-[#003a70] hover:bg-[#002a52]"
          }`}
        >
          {added ? <><Check className="w-4 h-4 mr-2" />Hinzugefügt</> : <><Plus className="w-4 h-4 mr-2" />Zum Warenkorb</>}
        </Button>
      </div>
    </div>
  );
}
