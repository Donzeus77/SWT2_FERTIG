import { Clock, MapPin, Euro } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

export default function FoodRescue() {
  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <header className="bg-[#003a70] text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Variable', sans-serif" }}>Food Rescue</h1>
        <p className="text-blue-100" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>Rette Lebensmittel & spare Geld</p>
      </header>

      <div className="p-4">
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Gemeinsam gegen Verschwendung!</strong> Hole dir
            Überraschungstüten zu reduzierten Preisen und hilf mit,
            Lebensmittel zu retten.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg" style={{ fontFamily: "'Variable', sans-serif", fontWeight: 700 }}>Hauptmensa</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  TU Campus Nord
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Verfügbar
              </Badge>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                Abholung: 19:00 - 20:00
              </div>
              <div className="flex items-center text-lg font-bold text-green-600">
                <Euro className="w-5 h-5" />
                3,99
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Überraschungstüte mit verschiedenen Gerichten vom heutigen Tag.
              Wert ca. 10€.
            </p>

            <Button className="w-full bg-[#003a70] hover:bg-[#002a52]">
              Jetzt reservieren
            </Button>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 opacity-60">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg" style={{ fontFamily: "'Variable', sans-serif", fontWeight: 700 }}>Archeteria</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  TU Campus Süd
                </div>
              </div>
              <Badge variant="outline">Ausverkauft</Badge>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                Abholung: 18:30 - 19:30
              </div>
              <div className="flex items-center text-lg font-bold text-gray-400">
                <Euro className="w-5 h-5" />
                2,99
              </div>
            </div>

            <Button className="w-full" variant="outline" disabled>
              Ausverkauft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
