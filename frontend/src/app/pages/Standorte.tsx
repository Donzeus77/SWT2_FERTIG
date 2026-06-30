import { useState } from "react";
import { Clock, MapPin, Users, ExternalLink, ChevronDown, Star, Navigation } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router";

interface Location {
  name: string;
  address: string;
  mapsUrl: string;
  hours: { weekdays: string; note?: string };
  occupancy: "low" | "medium" | "high";
  campus: string;
  description: string;
  features: string[];
}

const LOCATIONS: Location[] = [
  { name: "Hauptmensa", address: "Vogelpothsweg 85, 44227 Dortmund", mapsUrl: "https://maps.google.com/?q=Hauptmensa+TU+Dortmund+Vogelpothsweg+85+44227+Dortmund", hours: { weekdays: "Mo–Fr  11:15–14:15" }, occupancy: "medium", campus: "TU Dortmund", description: "Größte Mensa auf dem Campus Nord mit täglich wechselndem Angebot und mehreren Ausgaben.", features: ["Salatbar", "Veganes Angebot", "Menülinien A–C"] },
  { name: "food fakultät", address: "Emil-Figge-Str. 42, 44227 Dortmund", mapsUrl: "https://maps.google.com/?q=food+fakult%C3%A4t+TU+Dortmund+Emil-Figge-Str+42", hours: { weekdays: "Mo–Fr  11:15–14:15" }, occupancy: "low", campus: "TU Dortmund", description: "Kleinere Mensa mit Fokus auf frisch zubereiteten Gerichten und veganen Optionen.", features: ["Vegane Spezialitäten", "Frisch gekocht"] },
  { name: "Galerie", address: "Vogelpothsweg 85, 44227 Dortmund", mapsUrl: "https://maps.google.com/?q=Galerie+Mensa+TU+Dortmund", hours: { weekdays: "Mo–Fr  11:15–14:15", note: "Mit Wintergarten" }, occupancy: "low", campus: "TU Dortmund", description: "Angenehmes Ambiente im Wintergarten. Ideal für eine ruhige Mittagspause.", features: ["Wintergarten", "Café-Atmosphäre"] },
  { name: "Mensa Süd", address: "August-Schmidt-Str. 2, 44227 Dortmund", mapsUrl: "https://maps.google.com/?q=Mensa+S%C3%BCd+TU+Dortmund+August-Schmidt-Str+2", hours: { weekdays: "Mo–Fr  11:15–14:15" }, occupancy: "medium", campus: "TU Dortmund", description: "Gut gelegene Mensa auf dem Campus Süd, in der Nähe des Maschinenbau-Gebäudes.", features: ["Campus Süd", "Tagesgericht"] },
  { name: "Archeteria", address: "August-Schmidt-Str. 2, 44227 Dortmund", mapsUrl: "https://maps.google.com/?q=Archeteria+TU+Dortmund", hours: { weekdays: "Mo–Fr  08:00–16:30", note: "Frühstück ab 8 Uhr" }, occupancy: "high", campus: "TU Dortmund", description: "Cafeteria mit erweiterten Öffnungszeiten — auch für Frühstück und Nachmittagssnacks.", features: ["Frühstück", "Snacks", "Heißgetränke"] },
  { name: "Mensa kostBar", address: "Emil-Figge-Str. 40, 44227 Dortmund", mapsUrl: "https://maps.google.com/?q=Mensa+kostBar+FH+Dortmund+Emil-Figge-Str+40", hours: { weekdays: "Mo–Fr  11:30–14:00" }, occupancy: "low", campus: "FH Dortmund", description: "Hauptmensa der FH Dortmund am Campus Emil-Figge mit breitem Mittagsangebot.", features: ["Salattheke", "Tagesmenü"] },
  { name: "Max-Ophüls-Platz", address: "Max-Ophüls-Platz 2, 44139 Dortmund", mapsUrl: "https://maps.google.com/?q=FH+Dortmund+Max-Oph%C3%BCls-Platz+2+44139+Dortmund", hours: { weekdays: "Mo–Fr  11:30–14:00" }, occupancy: "low", campus: "FH Dortmund", description: "Mensa am Innenstadt-Campus der FH Dortmund.", features: ["Innenstadtlage", "Mittagsmenü"] },
  { name: "Mensa Sonnenstraße", address: "Sonnenstr. 100, 44139 Dortmund", mapsUrl: "https://maps.google.com/?q=Mensa+Sonnenstra%C3%9Fe+Dortmund+Sonnenstr+100", hours: { weekdays: "Mo–Fr  11:30–14:00" }, occupancy: "low", campus: "FH Dortmund", description: "Mensa im Kreuzviertel, in der Nähe des Campus Sonnenstraße.", features: ["Kreuzviertel", "Mittagsmenü"] },
];

const occConfig = {
  low:    { color: "bg-green-100 text-green-700",  bar: "bg-green-500",  label: "Wenig besucht",  pct: 25 },
  medium: { color: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-500", label: "Mäßig besucht", pct: 60 },
  high:   { color: "bg-red-100 text-red-700",      bar: "bg-red-500",    label: "Stark besucht",  pct: 90 },
};

function LocationCard({ loc }: { loc: Location }) {
  const { favoriteMensa } = useUser();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const occ = occConfig[loc.occupancy];
  const isFav = favoriteMensa === loc.name;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${isFav ? "border-yellow-300" : "border-gray-100"}`}>
      {isFav && (
        <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-1.5 flex items-center gap-1.5">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-yellow-700 font-medium">Deine Lieblings-Mensa</span>
        </div>
      )}
      <button onClick={() => setExpanded((v) => !v)} className="w-full text-left p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>{loc.name}</h3>
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${occ.color}`}>
            <Users className="w-3 h-3" />{occ.label}
          </div>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div className={`h-full rounded-full ${occ.bar}`} style={{ width: `${occ.pct}%` }} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />{loc.hours.weekdays}
          {loc.hours.note && <span className="text-gray-400">· {loc.hours.note}</span>}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />{loc.address}
        </div>
        <div className="flex items-center gap-1 text-xs text-[#003a70] mt-2 font-medium">
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Weniger anzeigen" : "Details & Route"}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <p className="text-sm text-gray-600 mt-3 mb-3">{loc.description}</p>
          <div className="flex flex-wrap gap-1 mb-4">
            {loc.features.map((f) => (
              <span key={f} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{f}</span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a href={loc.mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#003a70] text-white text-sm font-medium hover:bg-[#002a52] transition-colors">
              <Navigation className="w-4 h-4" />Route
            </a>
            <button onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#003a70] text-[#003a70] text-sm font-medium hover:bg-blue-50 transition-colors">
              <ExternalLink className="w-4 h-4" />Speiseplan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Standorte() {
  const [activeTab, setActiveTab] = useState<"TU Dortmund" | "FH Dortmund">("TU Dortmund");
  const filtered = LOCATIONS.filter((l) => l.campus === activeTab);

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <header className="bg-[#003a70] text-white p-6 shadow-lg">
        <h1 className="text-2xl mb-1" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>Standorte</h1>
        <p className="text-blue-100 text-sm">Mensen & Öffnungszeiten</p>
      </header>
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {(["TU Dortmund", "FH Dortmund"] as const).map((campus) => (
            <button key={campus} onClick={() => setActiveTab(campus)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === campus ? "border-[#003a70] text-[#003a70]" : "border-transparent text-gray-500"}`}>
              {campus}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 space-y-3">
        {filtered.map((loc) => <LocationCard key={loc.name} loc={loc} />)}
      </div>
    </div>
  );
}
