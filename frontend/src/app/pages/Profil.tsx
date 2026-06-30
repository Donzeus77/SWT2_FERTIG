import { useState } from "react";
import {
  LogIn, User, Settings, TrendingUp, ArrowLeft, Eye, EyeOff,
  CheckCircle, Mail, Lock, UserPlus, Bell, ChevronRight, LogOut,
  Star, MapPin, Heart, Package, Clock, ThumbsUp, Leaf,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useUser, type AuthUser } from "../context/UserContext";
import { useOrders } from "../context/OrderContext";

type AuthView = "landing" | "login" | "register" | "verify";

const VALID_DOMAINS = ["stud.tu-dortmund.de", "stud.fh-dortmund.de", "tu-dortmund.de", "fh-dortmund.de"];
const isValidUniEmail = (e: string) => VALID_DOMAINS.some((d) => e.toLowerCase().endsWith("@" + d));

const ALL_MENSAS = [
  { name: "Hauptmensa", campus: "TU Dortmund" },
  { name: "food fakultät", campus: "TU Dortmund" },
  { name: "Galerie", campus: "TU Dortmund" },
  { name: "Mensa Süd", campus: "TU Dortmund" },
  { name: "Archeteria", campus: "TU Dortmund" },
  { name: "Mensa kostBar", campus: "FH Dortmund" },
  { name: "Max-Ophüls-Platz", campus: "FH Dortmund" },
  { name: "Mensa Sonnenstraße", campus: "FH Dortmund" },
];

const DIETARY_OPTIONS = ["Vegan", "Vegetarisch", "Halal"];
const ALLERGEN_OPTIONS = ["Gluten", "Milch", "Ei", "Nüsse", "Erdnuss", "Soja", "Sellerie", "Senf", "Sesam", "Fisch"];

const WISH_DISHES = [
  { id: "w1", name: "Veganes Sushi Bowl", category: "Vegan" },
  { id: "w2", name: "Shakshuka", category: "Vegetarisch" },
  { id: "w3", name: "Ramen mit Hähnchen", category: "Halal" },
  { id: "w4", name: "Burrito Bowl", category: "Vegan" },
  { id: "w5", name: "Griechischer Salat mit Falafel", category: "Vegetarisch" },
  { id: "w6", name: "Pulled Jackfruit Sandwich", category: "Vegan" },
  { id: "w7", name: "Linsen-Dhal", category: "Vegan" },
  { id: "w8", name: "Köfte mit Bulgur", category: "Halal" },
];

function loadVotes(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem("wishVotes") ?? "{}"); } catch { return {}; }
}
function loadVotedIds(): string[] {
  try { return JSON.parse(localStorage.getItem("votedIds") ?? "[]"); } catch { return []; }
}

// ── Logged-in view ──────────────────────────────────────────────────────────
function LoggedInView({ onLogout }: { onLogout: () => void }) {
  const { authUser, favoriteMensa, setFavoriteMensa, preferences, setPreferences, discountRate } = useUser();
  const { orders, markCollected } = useOrders();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [prefOpen, setPrefOpen] = useState(false);
  const [voteOpen, setVoteOpen] = useState(false);
  const [votes, setVotes] = useState(loadVotes);
  const [votedIds, setVotedIds] = useState(loadVotedIds);

  const initials = ((authUser!.firstName[0] ?? "") + (authUser!.lastName[0] ?? "")).toUpperCase();

  const handleVote = (id: string) => {
    if (votedIds.includes(id)) return;
    const next = { ...votes, [id]: (votes[id] ?? 0) + 1 };
    const nextVoted = [...votedIds, id];
    setVotes(next); setVotedIds(nextVoted);
    localStorage.setItem("wishVotes", JSON.stringify(next));
    localStorage.setItem("votedIds", JSON.stringify(nextVoted));
  };

  const toggleDietary = (d: string) => {
    const cur = preferences.dietary;
    setPreferences({ ...preferences, dietary: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d] });
  };
  const toggleAllergen = (a: string) => {
    const cur = preferences.allergens;
    setPreferences({ ...preferences, allergens: cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a] });
  };

  const maxVotes = Math.max(1, ...Object.values(votes));
  const sortedDishes = [...WISH_DISHES].sort((a, b) => (votes[b.id] ?? 0) - (votes[a.id] ?? 0));

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <header className="bg-[#003a70] text-white p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">{initials}</div>
          <div>
            <h1 className="text-xl" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
              {authUser!.firstName} {authUser!.lastName}
            </h1>
            <p className="text-blue-200 text-sm">{authUser!.email}</p>
            {authUser!.type === "student" && (
              <span className="inline-block mt-1 text-xs bg-blue-100 text-[#003a70] font-semibold px-2 py-0.5 rounded-full">
                Studierendenpreis aktiv
              </span>
            )}
            {authUser!.type === "staff" && (
              <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                Bediensteten-Preis aktiv
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {/* Info card */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Hochschule", value: authUser!.campus },
            { label: "Matrikel", value: authUser!.matrikel },
            { label: "Preisgruppe", value: authUser!.type === "student" ? "Studierende" : authUser!.type === "staff" ? "Bedienstete" : "Gast" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-gray-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Lieblings-Mensa */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button onClick={() => setPickerOpen((v) => !v)}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors text-left">
            <div className="w-9 h-9 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
              <Star className={`w-5 h-5 ${favoriteMensa ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{favoriteMensa ?? "Lieblings-Mensa wählen"}</p>
              {favoriteMensa && <p className="text-xs text-gray-400">{ALL_MENSAS.find((m) => m.name === favoriteMensa)?.campus}</p>}
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${pickerOpen ? "rotate-90" : ""}`} />
          </button>
          {pickerOpen && (
            <div className="border-t border-gray-100">
              {["TU Dortmund", "FH Dortmund"].map((campus) => (
                <div key={campus}>
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase bg-gray-50">{campus}</p>
                  {ALL_MENSAS.filter((m) => m.campus === campus).map((mensa) => {
                    const sel = favoriteMensa === mensa.name;
                    return (
                      <button key={mensa.name} onClick={() => { setFavoriteMensa(sel ? null : mensa.name); setPickerOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-50 last:border-0 transition-colors ${sel ? "bg-yellow-50" : "hover:bg-gray-50"}`}>
                        <MapPin className={`w-4 h-4 flex-shrink-0 ${sel ? "text-yellow-500" : "text-gray-300"}`} />
                        <span className={`text-sm flex-1 ${sel ? "font-semibold text-gray-900" : "text-gray-700"}`}>{mensa.name}</span>
                        {sel && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                      </button>
                    );
                  })}
                </div>
              ))}
              {favoriteMensa && (
                <button onClick={() => { setFavoriteMensa(null); setPickerOpen(false); }}
                  className="w-full px-4 py-3 text-sm text-red-400 hover:bg-red-50 text-left border-t border-gray-100">
                  Auswahl entfernen
                </button>
              )}
            </div>
          )}
        </div>

        {/* Ernährungspräferenzen */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button onClick={() => setPrefOpen((v) => !v)}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 text-left transition-colors">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Ernährungspräferenzen</p>
              <p className="text-xs text-gray-400">
                {preferences.dietary.length + preferences.allergens.length > 0
                  ? `${preferences.dietary.length + preferences.allergens.length} Filter gespeichert`
                  : "Allergene & Ernährungsform festlegen"}
              </p>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${prefOpen ? "rotate-90" : ""}`} />
          </button>
          {prefOpen && (
            <div className="border-t border-gray-100 px-4 py-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ernährungsform</p>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((d) => {
                    const on = preferences.dietary.includes(d);
                    return (
                      <button key={d} onClick={() => toggleDietary(d)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${on ? "bg-[#003a70] text-white border-[#003a70]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Allergene ausschließen</p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_OPTIONS.map((a) => {
                    const on = preferences.allergens.includes(a);
                    return (
                      <button key={a} onClick={() => toggleAllergen(a)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${on ? "bg-red-500 text-white border-red-500" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-green-600">Einstellungen werden automatisch gespeichert und im Speiseplan angewendet.</p>
            </div>
          )}
        </div>

        {/* Abstimmungstool */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button onClick={() => setVoteOpen((v) => !v)}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 text-left transition-colors">
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
              <ThumbsUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Wunschgericht abstimmen</p>
              <p className="text-xs text-gray-400">{votedIds.length} von {WISH_DISHES.length} bewertet · Community-Voting</p>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${voteOpen ? "rotate-90" : ""}`} />
          </button>
          {voteOpen && (
            <div className="border-t border-gray-100 px-4 py-4 space-y-3">
              <p className="text-xs text-gray-500">Stimme für Gerichte ab, die du gerne auf dem Speiseplan sehen würdest. Die beliebtesten Gerichte werden regelmäßig ans Studierendenwerk weitergeleitet.</p>
              {sortedDishes.map((dish) => {
                const count = votes[dish.id] ?? 0;
                const voted = votedIds.includes(dish.id);
                const pct = count === 0 ? 0 : Math.round((count / maxVotes) * 100);
                return (
                  <div key={dish.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{dish.name}</p>
                        <p className="text-xs text-gray-400">{dish.category} · {count} Stimme{count !== 1 ? "n" : ""}</p>
                      </div>
                      <button onClick={() => handleVote(dish.id)} disabled={voted}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${voted ? "bg-purple-100 text-purple-600" : "bg-[#003a70] text-white hover:bg-[#002a52]"}`}>
                        <ThumbsUp className="w-3 h-3" />{voted ? "Abgestimmt" : "Abstimmen"}
                      </button>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bestellhistorie */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button onClick={() => setOrdersOpen((v) => !v)}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 text-left transition-colors">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-[#003a70]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Meine Bestellungen</p>
              <p className="text-xs text-gray-400">{orders.length} Bestellung{orders.length !== 1 ? "en" : ""}</p>
            </div>
            {orders.filter((o) => o.status !== "collected").length > 0 && (
              <span className="w-5 h-5 bg-[#003a70] text-white text-[10px] font-bold rounded-full flex items-center justify-center mr-1">
                {orders.filter((o) => o.status !== "collected").length}
              </span>
            )}
            <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${ordersOpen ? "rotate-90" : ""}`} />
          </button>
          {ordersOpen && (
            <div className="border-t border-gray-100">
              {orders.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Noch keine Bestellungen</p>
              ) : orders.map((order) => (
                <div key={order.id} className="border-b border-gray-50 last:border-0 px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{order.items.map((i) => i.name).join(", ")}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Abholung {order.pickupTime} Uhr</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#003a70]">{order.total.toFixed(2)} €</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${order.status === "collected" ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-700"}`}>
                        {order.status === "collected" ? "Abgeholt" : "Offen"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{order.code}</span>
                    {order.status !== "collected" && (
                      <button onClick={() => markCollected(order.id)} className="text-xs text-gray-400 hover:text-gray-600 underline">
                        Als abgeholt markieren
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sonstiges */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {[
            { icon: <Bell className="w-5 h-5 text-[#003a70]" />, label: "Benachrichtigungen" },
            { icon: <Settings className="w-5 h-5 text-[#003a70]" />, label: "Einstellungen" },
          ].map(({ icon, label }, i, arr) => (
            <button key={i} className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 text-left ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
              {icon}<span className="flex-1 text-sm text-gray-800">{label}</span><ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ))}
        </div>

        <Button variant="outline" className="w-full border-red-200 text-red-500 hover:bg-red-50 h-11" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />Abmelden
        </Button>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function Profil() {
  const { isLoggedIn, login, logout } = useUser();
  const [view, setView] = useState<AuthView>("landing");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [regFirst, setRegFirst] = useState("");
  const [regLast, setRegLast] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMatrikel, setRegMatrikel] = useState("");
  const [regCampus, setRegCampus] = useState("TU Dortmund");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  if (isLoggedIn) {
    return <LoggedInView onLogout={() => { logout(); setView("landing"); }} />;
  }

  const handleLogin = () => {
    setLoginError("");
    if (!loginEmail || !loginPassword) { setLoginError("Bitte alle Felder ausfüllen."); return; }
    if (!isValidUniEmail(loginEmail)) { setLoginError("Nur Uni-E-Mail-Adressen erlaubt."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({
        firstName: "Max", lastName: "Mustermann", email: loginEmail,
        campus: loginEmail.includes("fh") ? "FH Dortmund" : "TU Dortmund",
        matrikel: "1234567", type: "student",
      } as AuthUser);
    }, 1200);
  };

  const handleRegister = () => {
    const errs: Record<string, string> = {};
    if (!regFirst.trim()) errs.firstName = "Vorname erforderlich";
    if (!regLast.trim()) errs.lastName = "Nachname erforderlich";
    if (!regEmail) errs.email = "E-Mail erforderlich";
    else if (!isValidUniEmail(regEmail)) errs.email = "Nur Uni-E-Mail-Adressen erlaubt";
    if (!regMatrikel || !/^\d{7}$/.test(regMatrikel)) errs.matrikel = "7-stellige Matrikelnummer";
    if (!regPassword || regPassword.length < 8) errs.password = "Mindestens 8 Zeichen";
    if (regPassword !== regConfirm) errs.confirm = "Passwörter stimmen nicht überein";
    setRegErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setView("verify"); }, 1400);
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({ firstName: regFirst, lastName: regLast, email: regEmail, campus: regCampus, matrikel: regMatrikel, type: "student" } as AuthUser);
    }, 1000);
  };

  const inputCls = (err?: string) =>
    `w-full px-3 py-3 border rounded-xl text-sm focus:outline-none focus:border-[#003a70] focus:ring-1 focus:ring-[#003a70] ${err ? "border-red-400" : "border-gray-200"}`;

  // ── Landing ──
  if (view === "landing") return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <header className="bg-[#003a70] text-white p-6 shadow-lg">
        <h1 className="text-2xl mb-1" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>Profil</h1>
        <p className="text-blue-100 text-sm">Dein persönlicher Bereich</p>
      </header>
      <div className="p-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center mb-5">
          <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-[#003a70]" />
          </div>
          <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>Nicht angemeldet</h3>
          <p className="text-gray-500 text-sm mb-2">Anmelden für Studierendenrabatt und personalisierte Ansicht.</p>
          <p className="text-xs text-gray-400 mb-5">Gastnutzung ohne Konto möglich — Bestellung zum Normalpreis.</p>
          <div className="space-y-2">
            <Button className="w-full bg-[#003a70] hover:bg-[#002a52] h-11" onClick={() => setView("login")}>
              <LogIn className="w-4 h-4 mr-2" />Anmelden
            </Button>
            <Button variant="outline" className="w-full h-11 border-[#003a70] text-[#003a70] hover:bg-blue-50" onClick={() => setView("register")}>
              <UserPlus className="w-4 h-4 mr-2" />Registrieren
            </Button>
          </div>
        </div>
        <h3 className="font-semibold mb-3 text-gray-700 text-sm" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>Mit Konto verfügbar</h3>
        <div className="space-y-2">
          {[
            { icon: <Star className="w-5 h-5 text-yellow-500" />, text: "Lieblings-Mensa & personalisierter Speiseplan" },
            { icon: <Heart className="w-5 h-5 text-green-500" />, text: "Ernährungspräferenzen dauerhaft speichern" },
            { icon: <ThumbsUp className="w-5 h-5 text-purple-500" />, text: "Für Wunschgerichte abstimmen" },
            { icon: <Package className="w-5 h-5 text-[#003a70]" />, text: "Bestellhistorie & QR-Codes" },
          ].map(({ icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
              {icon}<span className="text-sm text-gray-700">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Login ──
  if (view === "login") return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <header className="bg-[#003a70] text-white p-6 shadow-lg">
        <button onClick={() => setView("landing")} className="flex items-center gap-2 text-blue-200 hover:text-white mb-3 text-sm"><ArrowLeft className="w-4 h-4" />Zurück</button>
        <h1 className="text-2xl mb-1" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>Anmelden</h1>
        <p className="text-blue-100 text-sm">Mit Uni-E-Mail einloggen</p>
      </header>
      <div className="p-4 mt-2">
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">E-Mail-Adresse</label>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" placeholder="vorname@stud.fh-dortmund.de" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#003a70] focus:ring-1 focus:ring-[#003a70]" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Passwort</label>
            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showPw ? "text" : "password"} placeholder="Dein Passwort" value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#003a70] focus:ring-1 focus:ring-[#003a70]" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {loginError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{loginError}</p>}
          <Button className="w-full bg-[#003a70] hover:bg-[#002a52] h-11" onClick={handleLogin} disabled={loading}>
            {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Anmelden…</span> : "Anmelden"}
          </Button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">Noch kein Konto?{" "}
          <button onClick={() => setView("register")} className="text-[#003a70] font-semibold">Registrieren</button>
        </p>
      </div>
    </div>
  );

  // ── Register ──
  if (view === "register") return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <header className="bg-[#003a70] text-white p-6 shadow-lg">
        <button onClick={() => setView("landing")} className="flex items-center gap-2 text-blue-200 hover:text-white mb-3 text-sm"><ArrowLeft className="w-4 h-4" />Zurück</button>
        <h1 className="text-2xl mb-1" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>Registrieren</h1>
        <p className="text-blue-100 text-sm">Konto erstellen · nur Uni-E-Mail</p>
      </header>
      <div className="p-4 mt-2 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-gray-700 block mb-1">Vorname</label>
              <input type="text" placeholder="Max" value={regFirst} onChange={(e) => setRegFirst(e.target.value)} className={inputCls(regErrors.firstName)} />
              {regErrors.firstName && <p className="text-xs text-red-500 mt-1">{regErrors.firstName}</p>}
            </div>
            <div><label className="text-xs font-medium text-gray-700 block mb-1">Nachname</label>
              <input type="text" placeholder="Mustermann" value={regLast} onChange={(e) => setRegLast(e.target.value)} className={inputCls(regErrors.lastName)} />
              {regErrors.lastName && <p className="text-xs text-red-500 mt-1">{regErrors.lastName}</p>}
            </div>
          </div>
          <div><label className="text-xs font-medium text-gray-700 block mb-1">Hochschule</label>
            <select value={regCampus} onChange={(e) => setRegCampus(e.target.value)} className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#003a70] bg-white">
              <option value="TU Dortmund">TU Dortmund</option>
              <option value="FH Dortmund">FH Dortmund</option>
            </select>
          </div>
          <div><label className="text-xs font-medium text-gray-700 block mb-1">Matrikelnummer</label>
            <input type="text" placeholder="1234567" value={regMatrikel} onChange={(e) => setRegMatrikel(e.target.value.replace(/\D/g, "").slice(0, 7))} className={inputCls(regErrors.matrikel)} />
            {regErrors.matrikel && <p className="text-xs text-red-500 mt-1">{regErrors.matrikel}</p>}
          </div>
          <div><label className="text-xs font-medium text-gray-700 block mb-1">Uni-E-Mail</label>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" placeholder={regCampus === "TU Dortmund" ? "m.mustermann@stud.tu-dortmund.de" : "m.mustermann@stud.fh-dortmund.de"}
                value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={`pl-10 ${inputCls(regErrors.email)}`} />
            </div>
            {regErrors.email && <p className="text-xs text-red-500 mt-1">{regErrors.email}</p>}
          </div>
          <div><label className="text-xs font-medium text-gray-700 block mb-1">Passwort</label>
            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showPw ? "text" : "password"} placeholder="Mindestens 8 Zeichen" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                className={`pl-10 pr-10 ${inputCls(regErrors.password)}`} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {regErrors.password && <p className="text-xs text-red-500 mt-1">{regErrors.password}</p>}
            {regPassword && <div className="flex gap-1 mt-2">{[8,12,16].map((l) => <div key={l} className={`h-1 flex-1 rounded-full ${regPassword.length >= l ? "bg-[#003a70]" : "bg-gray-200"}`} />)}</div>}
          </div>
          <div><label className="text-xs font-medium text-gray-700 block mb-1">Passwort bestätigen</label>
            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showPw ? "text" : "password"} placeholder="Passwort wiederholen" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                className={`pl-10 ${inputCls(regErrors.confirm)}`} />
            </div>
            {regErrors.confirm && <p className="text-xs text-red-500 mt-1">{regErrors.confirm}</p>}
          </div>
          <Button className="w-full bg-[#003a70] hover:bg-[#002a52] h-11" onClick={handleRegister} disabled={loading}>
            {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Erstelle Konto…</span> : "Konto erstellen"}
          </Button>
        </div>
        <p className="text-center text-sm text-gray-500">Bereits registriert?{" "}
          <button onClick={() => setView("login")} className="text-[#003a70] font-semibold">Anmelden</button>
        </p>
      </div>
    </div>
  );

  // ── Verify ──
  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <header className="bg-[#003a70] text-white p-6 shadow-lg">
        <h1 className="text-2xl mb-1" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>E-Mail bestätigen</h1>
        <p className="text-blue-100 text-sm">Fast geschafft!</p>
      </header>
      <div className="p-4 mt-6 text-center">
        <div className="w-20 h-20 mx-auto mb-5 bg-blue-50 rounded-full flex items-center justify-center">
          <Mail className="w-10 h-10 text-[#003a70]" />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>Bestätigungsmail gesendet</h3>
        <p className="text-gray-500 text-sm mb-1">Wir haben eine E-Mail an</p>
        <p className="font-semibold text-[#003a70] text-sm mb-5">{regEmail}</p>
        <p className="text-gray-500 text-sm mb-8">Klicke auf den Link, um dein Konto zu aktivieren.</p>
        <Button className="w-full bg-[#003a70] hover:bg-[#002a52] h-11 mb-3" onClick={handleVerify} disabled={loading}>
          {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Aktiviere…</span>
            : <><CheckCircle className="w-4 h-4 mr-2" />E-Mail bestätigt (Simulation)</>}
        </Button>
        <button onClick={() => setView("register")} className="text-sm text-gray-400 hover:text-gray-600">Zurück zur Registrierung</button>
      </div>
    </div>
  );
}
