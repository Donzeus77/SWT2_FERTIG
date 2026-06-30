import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ShoppingCart, Trash2, Plus, Minus, ChevronRight, CreditCard,
  CheckCircle, QrCode, ArrowLeft, Clock, History, Package,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import type { Order } from "../context/OrderContext";

type Step = "cart" | "payment" | "pickup" | "processing" | "success";
type PaymentMethod = "card" | "paypal";

const PAYMENT_METHODS = [
  {
    id: "card" as PaymentMethod,
    label: "Kredit- / Debitkarte",
    description: "•••• •••• •••• 4242",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    id: "paypal" as PaymentMethod,
    label: "PayPal",
    description: "student@stud.fh-dortmund.de",
    icon: (
      <span className="text-[#003087] font-extrabold text-sm leading-none">
        P<span className="text-[#009cde]">P</span>
      </span>
    ),
  },
];

function generateCode() {
  const L = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const D = "0123456789";
  return (
    L[Math.floor(Math.random() * L.length)] +
    L[Math.floor(Math.random() * L.length)] +
    D[Math.floor(Math.random() * D.length)] +
    D[Math.floor(Math.random() * D.length)] +
    D[Math.floor(Math.random() * D.length)]
  );
}

function generatePickupSlots(): string[] {
  const slots: string[] = [];
  const now = new Date();
  // Round up to next 5-min mark + 15 min minimum lead time
  const start = new Date(now);
  start.setMinutes(Math.ceil((now.getMinutes() + 15) / 5) * 5, 0, 0);
  for (let i = 0; i < 8; i++) {
    const slot = new Date(start.getTime() + i * 10 * 60 * 1000);
    if (slot.getHours() >= 14 && slot.getMinutes() > 15) break;
    slots.push(slot.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }));
  }
  return slots.length > 0 ? slots : ["11:30", "11:40", "11:50", "12:00", "12:10", "12:20", "12:30", "12:40"];
}

// ── QR Code visual ────────────────────────────────────────────────────────────
function QRDisplay({ code }: { code: string }) {
  return (
    <div className="mx-auto w-44 h-44 border-2 border-gray-900 rounded-lg p-3 grid grid-cols-7 gap-0.5">
      {Array.from({ length: 49 }).map((_, i) => {
        const row = Math.floor(i / 7);
        const col = i % 7;
        const tl = (row < 3 && col < 3) || (row === 2 && col < 3) || (row < 3 && col === 2);
        const tr = (row < 3 && col > 3) || (row === 2 && col > 3) || (row < 3 && col === 4);
        const bl = (row > 3 && col < 3) || (row === 4 && col < 3) || (row > 3 && col === 2);
        const corner = tl || tr || bl;
        const seed = code.charCodeAt(i % code.length);
        const filled = corner || (!corner && (seed * (i + 1)) % 3 === 0);
        return <div key={i} className={`rounded-[1px] ${filled ? "bg-gray-900" : "bg-white"}`} />;
      })}
    </div>
  );
}

// ── Past order card ───────────────────────────────────────────────────────────
function OrderCard({ order, onCollected }: { order: Order; onCollected: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor =
    order.status === "collected"
      ? "bg-gray-100 text-gray-500"
      : order.status === "ready"
      ? "bg-green-100 text-green-700"
      : "bg-blue-100 text-blue-700";
  const statusLabel =
    order.status === "collected" ? "Abgeholt" : order.status === "ready" ? "Bereit" : "In Bearbeitung";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5 text-[#003a70]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">
            {order.items.map((i) => i.name).join(", ").slice(0, 40)}
            {order.items.map((i) => i.name).join(", ").length > 40 ? "…" : ""}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Abholung {order.pickupTime} Uhr</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>{statusLabel}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-[#003a70] text-sm">{order.total.toFixed(2)} €</p>
          <p className="text-xs text-gray-400 font-mono">{order.code}</p>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bestellte Artikel</p>
              <div className="space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-700">
                    <span>{item.quantity}× {item.name}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              {order.status !== "collected" && (
                <button
                  onClick={onCollected}
                  className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Als abgeholt markieren
                </button>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <QRDisplay code={order.code} />
              <p className="text-lg font-mono font-bold tracking-widest text-gray-900">{order.code}</p>
              <p className="text-xs text-gray-400 text-center">An der Ausgabe scannen lassen</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Bestellungen() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { orders, addOrder, markCollected } = useOrders();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("cart");
  const [activeTab, setActiveTab] = useState<"cart" | "history">(
    items.length === 0 && orders.length > 0 ? "history" : "cart"
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("card");
  const [pickupSlots] = useState(generatePickupSlots);
  const [selectedPickup, setSelectedPickup] = useState(pickupSlots[0] ?? "12:00");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const handlePay = () => {
    setStep("processing");
    const code = generateCode();
    const order: Omit<Order, "id" | "createdAt"> = {
      code,
      items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      total: totalPrice,
      pickupTime: selectedPickup,
      location: items[0]?.location ?? "Mensa",
      paymentMethod: selectedPayment === "card" ? "Kredit-/Debitkarte" : "PayPal",
      status: "pending",
    };
    setTimeout(() => {
      addOrder(order);
      setCurrentOrder({ ...order, id: "current", createdAt: new Date().toISOString() });
      clearCart();
      setStep("success");
    }, 2200);
  };

  // ── Processing ──────────────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-[#003a70] flex flex-col items-center justify-center p-6">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-blue-300 opacity-30" />
          <div className="absolute inset-0 rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <h2 className="text-white text-2xl mb-2 text-center" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
          Zahlung wird verarbeitet…
        </h2>
        <p className="text-blue-200 text-sm text-center">Bitte warten</p>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (step === "success" && currentOrder) {
    return (
      <div className="pb-24 min-h-screen bg-gray-50">
        <div className="bg-[#003a70] text-white p-6 pb-10">
          <div className="flex items-center gap-3 mb-1">
            <CheckCircle className="w-7 h-7 text-green-300" />
            <h1 className="text-2xl" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
              Bestellung bestätigt
            </h1>
          </div>
          <p className="text-blue-100 text-sm">Dein QR-Code ist bereit zur Abholung</p>
        </div>

        <div className="p-4 -mt-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Abholcode</p>
            <QRDisplay code={currentOrder.code} />
            <div className="text-3xl font-mono font-bold tracking-[0.25em] text-gray-900 mt-4 mb-1">
              {currentOrder.code}
            </div>
            <p className="text-xs text-gray-400 mb-4">Zeige diesen Code an der Ausgabe</p>
            <div className="flex items-center justify-center gap-2 text-sm text-[#003a70] border-t border-gray-100 pt-4">
              <Clock className="w-4 h-4" />
              <span>Abholung um <strong>{currentOrder.pickupTime} Uhr</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
            <QrCode className="w-8 h-8 text-[#003a70] flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Der Code ist auch unter <strong>Meine Bestellungen</strong> gespeichert — du kannst ihn jederzeit aufrufen.
            </p>
          </div>

          <Button
            className="w-full bg-[#003a70] hover:bg-[#002a52] h-11 mb-3"
            onClick={() => { setStep("cart"); setActiveTab("history"); }}
          >
            <History className="w-4 h-4 mr-2" />
            Meine Bestellungen ansehen
          </Button>
          <Button
            variant="outline"
            className="w-full border-gray-200 text-gray-600 h-11"
            onClick={() => { setStep("cart"); setActiveTab("cart"); setCurrentOrder(null); }}
          >
            Neue Bestellung starten
          </Button>
        </div>
      </div>
    );
  }

  // ── Payment ─────────────────────────────────────────────────────────────────
  if (step === "payment") {
    return (
      <div className="pb-24 min-h-screen bg-gray-50">
        <header className="bg-[#003a70] text-white p-6 shadow-lg">
          <button onClick={() => setStep("cart")} className="flex items-center gap-2 text-blue-200 hover:text-white mb-3 text-sm">
            <ArrowLeft className="w-4 h-4" />Zurück
          </button>
          <h1 className="text-2xl mb-1" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>Zahlungsart</h1>
          <p className="text-blue-100 text-sm">Wähle deine bevorzugte Zahlungsmethode</p>
        </header>

        <div className="p-4 space-y-3 mt-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedPayment(method.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 bg-white transition-all text-left ${
                selectedPayment === method.id ? "border-[#003a70] shadow-md" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                selectedPayment === method.id ? "bg-[#003a70] text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {method.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{method.label}</p>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPayment === method.id ? "border-[#003a70]" : "border-gray-300"
              }`}>
                {selectedPayment === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#003a70]" />}
              </div>
            </button>
          ))}

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>Bestellübersicht</p>
            <div className="space-y-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span>{item.quantity}× {item.name}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-[#003a70] border-t border-gray-100 mt-3 pt-3">
              <span>Gesamt</span>
              <span>{totalPrice.toFixed(2)} €</span>
            </div>
          </div>

          <Button className="w-full bg-[#003a70] hover:bg-[#002a52] h-12 text-base" onClick={() => setStep("pickup")}>
            Weiter zur Abholzeit
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-center text-xs text-gray-400">Simulierte Zahlung — keine echten Daten werden übertragen</p>
        </div>
      </div>
    );
  }

  // ── Pickup time ─────────────────────────────────────────────────────────────
  if (step === "pickup") {
    return (
      <div className="pb-24 min-h-screen bg-gray-50">
        <header className="bg-[#003a70] text-white p-6 shadow-lg">
          <button onClick={() => setStep("payment")} className="flex items-center gap-2 text-blue-200 hover:text-white mb-3 text-sm">
            <ArrowLeft className="w-4 h-4" />Zurück
          </button>
          <h1 className="text-2xl mb-1" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>Abholzeit</h1>
          <p className="text-blue-100 text-sm">Wann möchtest du dein Essen abholen?</p>
        </header>

        <div className="p-4 mt-2 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Verfügbare Zeitfenster</p>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              {pickupSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedPickup(slot)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    selectedPickup === slot
                      ? "border-[#003a70] bg-[#003a70] text-white shadow-sm"
                      : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                  }`}
                >
                  <Clock className={`w-4 h-4 ${selectedPickup === slot ? "text-blue-200" : "text-gray-400"}`} />
                  {slot} Uhr
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[#003a70]" />
              <p className="text-sm font-semibold text-[#003a70]">Gewählte Abholzeit</p>
            </div>
            <p className="text-2xl font-bold text-[#003a70]">{selectedPickup} Uhr</p>
            <p className="text-xs text-blue-600 mt-1">Dein Gericht wird zur gewählten Zeit an der Ausgabe bereitgestellt.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex justify-between font-bold text-[#003a70] text-lg">
              <span style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>Gesamt</span>
              <span>{totalPrice.toFixed(2)} €</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Zahlung via {selectedPayment === "card" ? "Kredit-/Debitkarte" : "PayPal"}
            </p>
          </div>

          <Button className="w-full bg-[#003a70] hover:bg-[#002a52] h-12 text-base" onClick={handlePay}>
            Jetzt {totalPrice.toFixed(2)} € bezahlen
          </Button>
        </div>
      </div>
    );
  }

  // ── Cart + History tabs ─────────────────────────────────────────────────────
  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <header className="bg-[#003a70] text-white p-6 shadow-lg">
        <h1 className="text-2xl mb-1" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
          Bestellen
        </h1>
        <p className="text-blue-100 text-sm">
          {activeTab === "cart"
            ? totalItems > 0 ? `${totalItems} Artikel im Warenkorb` : "Warenkorb leer"
            : `${orders.length} Bestellung${orders.length !== 1 ? "en" : ""}`}
        </p>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {[
            { key: "cart", label: "Warenkorb", icon: <ShoppingCart className="w-4 h-4" /> },
            { key: "history", label: "Meine Bestellungen", icon: <History className="w-4 h-4" /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as "cart" | "history")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? "border-[#003a70] text-[#003a70]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {icon}{label}
              {key === "history" && orders.filter((o) => o.status !== "collected").length > 0 && (
                <span className="w-4 h-4 bg-[#003a70] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {orders.filter((o) => o.status !== "collected").length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* ── Cart tab ── */}
        {activeTab === "cart" && (
          <>
            {items.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center mt-4">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-700" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
                  Warenkorb leer
                </h3>
                <p className="text-gray-500 text-sm mb-6">Wähle Gerichte aus dem Speiseplan.</p>
                <Button className="bg-[#003a70] hover:bg-[#002a52]" onClick={() => navigate("/")}>
                  Zum Speiseplan
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mt-2">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 pr-3">
                          <p className="font-semibold text-gray-900 text-sm" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.location}</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#003a70] hover:text-[#003a70] transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-semibold w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#003a70] hover:text-[#003a70] transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-[#003a70]">{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Zwischensumme</span><span>{totalPrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>Abholung</span><span className="text-green-600 font-medium">Gratis</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-3 mb-4">
                    <span style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>Gesamt</span>
                    <span className="text-[#003a70]">{totalPrice.toFixed(2)} €</span>
                  </div>
                  <Button className="w-full bg-[#003a70] hover:bg-[#002a52] h-12 text-base" onClick={() => setStep("payment")}>
                    Weiter zur Zahlung
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {/* ── History tab ── */}
        {activeTab === "history" && (
          <>
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center mt-4">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <History className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-700" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
                  Noch keine Bestellungen
                </h3>
                <p className="text-gray-500 text-sm mb-6">Deine QR-Codes werden hier gespeichert.</p>
                <Button className="bg-[#003a70] hover:bg-[#002a52]" onClick={() => setActiveTab("cart")}>
                  Zum Warenkorb
                </Button>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} onCollected={() => markCollected(order.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
