import { BrowserRouter, Routes, Route } from "react-router";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Standorte from "./pages/Standorte";
import Bestellungen from "./pages/Bestellungen";
import Profil from "./pages/Profil";
import Abstimmung from "./pages/Abstimmung";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";
import { OrderProvider } from "./context/OrderContext";

export default function App() {
  return (
    <UserProvider>
      <OrderProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-200 flex items-start justify-center">
              <div
                className="relative w-full bg-white shadow-2xl overflow-hidden"
                style={{ maxWidth: "430px", minHeight: "100svh" }}
              >
                <div className="overflow-y-auto" style={{ height: "100svh" }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/standorte" element={<Standorte />} />
                    <Route path="/bestellungen" element={<Bestellungen />} />
                    <Route path="/abstimmung" element={<Abstimmung />} />
                    <Route path="/profil" element={<Profil />} />
                  </Routes>
                  <Navigation />
                </div>
              </div>
            </div>
          </BrowserRouter>
        </CartProvider>
      </OrderProvider>
    </UserProvider>
  );
}
