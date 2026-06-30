import { X, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useUser } from "../context/UserContext";
import { useState } from "react";

interface FilterOptions { allergens: string[]; dietary: string[]; }
interface MenuFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const allergenOptions = ["Gluten","Milch","Ei","Nüsse","Erdnuss","Soja","Sellerie","Senf","Sesam","Fisch"];
const dietaryOptions = ["Vegan","Vegetarisch","Halal"];

export default function MenuFilters({ open, onOpenChange, filters, onFiltersChange }: MenuFiltersProps) {
  const { isLoggedIn, setPreferences, preferences } = useUser();
  const [saved, setSaved] = useState(false);

  const toggle = (key: "allergens" | "dietary", value: string) => {
    const cur = filters[key];
    onFiltersChange({ ...filters, [key]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value] });
  };

  const saveToProfile = () => {
    setPreferences(filters);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasActiveFilters = filters.allergens.length > 0 || filters.dietary.length > 0;

  const prefsMatch =
    JSON.stringify([...filters.dietary].sort()) === JSON.stringify([...preferences.dietary].sort()) &&
    JSON.stringify([...filters.allergens].sort()) === JSON.stringify([...preferences.allergens].sort());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="pb-2">
          <SheetTitle>Filter & Präferenzen</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-6 overflow-y-auto max-h-[calc(85vh-160px)] pb-2">
          <div>
            <h3 className="font-semibold mb-3 text-sm text-gray-700">Ernährungsform</h3>
            <div className="space-y-2.5">
              {dietaryOptions.map((option) => (
                <div key={option} className="flex items-center space-x-3">
                  <Checkbox id={`d-${option}`} checked={filters.dietary.includes(option)} onCheckedChange={() => toggle("dietary", option)} />
                  <Label htmlFor={`d-${option}`} className="text-sm font-normal cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm text-gray-700">Allergene ausschließen</h3>
            <div className="space-y-2.5">
              {allergenOptions.map((option) => (
                <div key={option} className="flex items-center space-x-3">
                  <Checkbox id={`a-${option}`} checked={filters.allergens.includes(option)} onCheckedChange={() => toggle("allergens", option)} />
                  <Label htmlFor={`a-${option}`} className="text-sm font-normal cursor-pointer">{option}</Label>
                </div>
              ))}
            </div>
          </div>

          {isLoggedIn && hasActiveFilters && !prefsMatch && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-700 mb-2">Diese Filter dauerhaft als Profil-Präferenzen speichern?</p>
              <button onClick={saveToProfile}
                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${saved ? "bg-green-100 text-green-700" : "bg-[#003a70] text-white hover:bg-[#002a52]"}`}>
                <Save className="w-3 h-3" />{saved ? "Gespeichert!" : "Im Profil speichern"}
              </button>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t space-y-2">
          {hasActiveFilters && (
            <Button variant="outline" onClick={() => onFiltersChange({ allergens: [], dietary: [] })} className="w-full">
              <X className="w-4 h-4 mr-2" />Alle Filter zurücksetzen
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)} className="w-full bg-[#003a70] hover:bg-[#002a52]">
            Anwenden
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
