import { Home, MapPin, ShoppingBag, User, ThumbsUp } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useCart } from "../context/CartContext";

const navItems = [
  { path: "/", icon: Home, label: "Speiseplan" },
  { path: "/standorte", icon: MapPin, label: "Standorte" },
  { path: "/bestellungen", icon: ShoppingBag, label: "Bestellen" },
  { path: "/abstimmung", icon: ThumbsUp, label: "Voting" },
  { path: "/profil", icon: User, label: "Profil" },
];

export default function Navigation() {
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-4">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const isCart = path === "/bestellungen";
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
                isActive ? "text-[#003a70]" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#003a70] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
