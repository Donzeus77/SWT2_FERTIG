import { useState, useEffect } from "react";
import { Filter, Star, CalendarDays, Calendar } from "lucide-react";
import { Badge } from "../components/ui/badge";
import MenuCard from "../components/MenuCard";
import MenuFilters from "../components/MenuFilters";
import { getMenuByDate, getWeekDates } from "../data/mockMenu";
import { useUser } from "../context/UserContext";

interface MenuItem {
  id: string; name: string; description: string; category: string;
  price: number; allergens: string[]; dietary: string[];
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
  available: boolean; location: string;
}

interface DailyMenu { date: string; items: MenuItem[]; }
interface FilterOptions { allergens: string[]; dietary: string[]; }

const CATEGORY_ORDER = ["hauptgericht", "beilage"];
const categoryNames: Record<string, string> = { hauptgericht: "Hauptgerichte", beilage: "Beilagen" };

const ALL_MENSAS = [
  { name: "Alle Standorte", short: "Alle" },
  { name: "Hauptmensa", short: "Hauptmensa" },
  { name: "food fakultät", short: "food fak." },
  { name: "Galerie", short: "Galerie" },
  { name: "Mensa Süd", short: "Mensa Süd" },
  { name: "Archeteria", short: "Archeteria" },
  { name: "Mensa kostBar", short: "kostBar" },
  { name: "Max-Ophüls-Platz", short: "M.-O.-Platz" },
  { name: "Mensa Sonnenstraße", short: "Sonnenstr." },
];

const DAY_NAMES = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MONTH_NAMES = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export default function Home() {
  const { favoriteMensa, preferences, isLoggedIn } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({ allergens: [], dietary: [] });
  const [selectedMensa, setSelectedMensa] = useState<string>(
    () => localStorage.getItem("favoriteMensa") ?? "Alle Standorte"
  );

  // Sync mensa selector with saved favorite
  useEffect(() => {
    if (favoriteMensa) setSelectedMensa(favoriteMensa);
  }, [favoriteMensa]);

  // Apply saved profile preferences as default filters
  useEffect(() => {
    if (preferences.dietary.length > 0 || preferences.allergens.length > 0) {
      setFilters(preferences);
    }
  }, []);

  const weekDates = getWeekDates(selectedDate);
  const todayStr = new Date().toISOString().split("T")[0];
  const selectedDateStr = selectedDate.toISOString().split("T")[0];

  const hasActiveFilters = filters.allergens.length > 0 || filters.dietary.length > 0;

  const filterItems = (items: MenuItem[]) =>
    items.filter((item) => {
      if (selectedMensa !== "Alle Standorte" && !item.location.toLowerCase().includes(selectedMensa.toLowerCase())) return false;
      if (filters.allergens.length > 0 && filters.allergens.some((a) => item.allergens.includes(a))) return false;
      if (filters.dietary.length > 0 && !filters.dietary.some((d) => item.dietary.includes(d))) return false;
      return true;
    });

  const isHighlighted = (item: MenuItem) =>
    isLoggedIn &&
    preferences.dietary.length > 0 &&
    preferences.dietary.some((d) => item.dietary.includes(d));

  const groupByCategory = (items: MenuItem[]) =>
    CATEGORY_ORDER.reduce((acc, cat) => {
      const m = items.filter((i) => i.category === cat);
      if (m.length > 0) acc[cat] = m;
      return acc;
    }, {} as Record<string, MenuItem[]>);

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${DAY_NAMES[d.getDay()]} ${d.getDate()}.`;
  };

  const formatDateLong = (d: Date) =>
    d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });

  // ── Day view ───────────────────────────────────────────────────────────────
  const renderDayContent = (dateStr: string) => {
    const menu = getMenuByDate(dateStr);
    const items = menu ? filterItems(menu.items) : [];
    const grouped = groupByCategory(items);

    if (!menu) return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Kein Speiseplan verfügbar.
      </div>
    );
    if (items.length === 0) return (
      <div className="text-center py-8 text-gray-400 text-sm">
        {hasActiveFilters
          ? "Keine Gerichte entsprechen deinen Filtern."
          : selectedMensa !== "Alle Standorte"
          ? `Kein Angebot für ${selectedMensa}.`
          : "Keine Gerichte verfügbar."}
      </div>
    );

    // Personalization: highlighted items first
    const highlightedItems = items.filter(isHighlighted);
    const showPersonalization = highlightedItems.length > 0 && isLoggedIn;

    return (
      <div className="space-y-5">
        {showPersonalization && (
          <div>
            <p className="text-xs font-semibold text-[#003a70] uppercase tracking-wide mb-2">
              ✦ Für dich empfohlen
            </p>
            <div className="space-y-3">
              {highlightedItems.map((item) => (
                <MenuCard key={item.id + "-hl"} item={item} highlight />
              ))}
            </div>
            <div className="border-t border-gray-200 my-4" />
          </div>
        )}
        {Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2"
              style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
              {categoryNames[cat] || cat}
            </h2>
            <div className="space-y-3">
              {catItems.map((item) => <MenuCard key={item.id} item={item} />)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003a70] text-white px-5 pt-5 pb-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl leading-tight" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
              Speiseplan
            </h1>
            {favoriteMensa ? (
              <div className="flex items-center gap-1 text-yellow-300 text-xs mt-0.5">
                <Star className="w-3 h-3 fill-yellow-300" />{favoriteMensa}
              </div>
            ) : (
              <p className="text-blue-200 text-xs mt-0.5">Studierendenwerk Dortmund</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-white/10 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("day")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "day" ? "bg-white text-[#003a70]" : "text-white"}`}
              >
                <Calendar className="w-3 h-3" />Tag
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "week" ? "bg-white text-[#003a70]" : "text-white"}`}
              >
                <CalendarDays className="w-3 h-3" />Woche
              </button>
            </div>
            <button
              onClick={() => setFiltersOpen(true)}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5" />
              {hasActiveFilters && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-400 text-[#003a70] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {filters.allergens.length + filters.dietary.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Day view: date nav */}
        {viewMode === "day" && (
          <div className="flex items-center gap-1 mt-1">
            <button
              onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }}
              className="p-1.5 hover:bg-white/10 rounded-lg text-blue-200 text-xs"
            >‹</button>
            <div className="flex-1 text-center">
              <span className="text-sm text-blue-100">
                {selectedDateStr === todayStr ? "Heute, " : ""}{formatDateLong(selectedDate)}
              </span>
            </div>
            <button
              onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }}
              className="p-1.5 hover:bg-white/10 rounded-lg text-blue-200 text-xs"
            >›</button>
          </div>
        )}

        {/* Week view: week nav */}
        {viewMode === "week" && (
          <div className="flex items-center gap-1 mt-1">
            <button
              onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(d); }}
              className="p-1.5 hover:bg-white/10 rounded-lg text-blue-200 text-xs"
            >‹</button>
            <div className="flex-1 text-center">
              <span className="text-sm text-blue-100">
                KW {getISOWeek(selectedDate)} — {MONTH_NAMES[new Date(weekDates[0]).getMonth()]} {new Date(weekDates[0]).getFullYear()}
              </span>
            </div>
            <button
              onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(d); }}
              className="p-1.5 hover:bg-white/10 rounded-lg text-blue-200 text-xs"
            >›</button>
          </div>
        )}
      </header>

      {/* Mensa selector */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="flex overflow-x-auto gap-0 px-2 py-2" style={{ scrollbarWidth: "none" }}>
          {ALL_MENSAS.map((m) => {
            const isSelected = selectedMensa === m.name;
            const isFav = favoriteMensa === m.name;
            return (
              <button
                key={m.name}
                onClick={() => setSelectedMensa(m.name)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 mx-0.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected ? "bg-[#003a70] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {isFav && <Star className={`w-3 h-3 ${isSelected ? "fill-yellow-300 text-yellow-300" : "fill-yellow-400 text-yellow-400"}`} />}
                {m.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active filters strip */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex flex-wrap gap-1 items-center">
          <span className="text-xs text-blue-600 font-medium mr-1">Filter:</span>
          {filters.dietary.map((d) => <Badge key={d} className="bg-[#003a70] text-white text-xs hover:bg-[#003a70]">{d}</Badge>)}
          {filters.allergens.map((a) => <Badge key={a} variant="outline" className="text-xs border-[#003a70] text-blue-700">Ohne {a}</Badge>)}
        </div>
      )}

      <div className="p-4">
        {/* ── Day view ── */}
        {viewMode === "day" && renderDayContent(selectedDateStr)}

        {/* ── Week view ── */}
        {viewMode === "week" && (
          <div>
            {/* Day tabs */}
            <div className="flex gap-1 mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {weekDates.map((dateStr) => {
                const isActive = dateStr === selectedDateStr;
                const isT = dateStr === todayStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(new Date(dateStr + "T12:00:00"))}
                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-all ${
                      isActive ? "bg-[#003a70] text-white" : isT ? "bg-blue-50 text-[#003a70] border border-[#003a70]" : "bg-white text-gray-600 border border-gray-200"
                    }`}
                  >
                    <span className="font-medium">{formatDateShort(dateStr)}</span>
                    {isT && <span className={`text-[10px] mt-0.5 ${isActive ? "text-blue-200" : "text-[#003a70]"}`}>Heute</span>}
                  </button>
                );
              })}
            </div>
            {renderDayContent(selectedDateStr)}
          </div>
        )}

      </div>

      <MenuFilters
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}

function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}
