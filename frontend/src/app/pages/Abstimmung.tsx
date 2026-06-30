import { useState, useEffect } from "react";
import { ThumbsUp, Trophy, Calendar, Lock } from "lucide-react";
import { useUser } from "../context/UserContext";
import { votesApi } from "../lib/api";

const WISH_DISHES = [
  { id: "w1", name: "Veganes Sushi Bowl", category: "Vegan", description: "Bowl mit Sushi-Reis, Avocado, Edamame und Miso-Dressing" },
  { id: "w2", name: "Shakshuka", category: "Vegetarisch", description: "Pochierte Eier in würziger Tomatensauce mit Feta" },
  { id: "w3", name: "Ramen mit Hähnchen", category: "Halal", description: "Japanische Nudelsuppe mit Hähnchen, Ei und Gemüse" },
  { id: "w4", name: "Burrito Bowl", category: "Vegan", description: "Reis, schwarze Bohnen, Guacamole, Salsa und Mais" },
  { id: "w5", name: "Griechischer Salat mit Falafel", category: "Vegetarisch", description: "Knusprige Falafel auf frischem Griechischen Salat" },
  { id: "w6", name: "Pulled Jackfruit Sandwich", category: "Vegan", description: "Herzhaftes Jackfruit im Brioche-Bun mit Coleslaw" },
  { id: "w7", name: "Linsen-Dhal", category: "Vegan", description: "Indisches Linsengericht mit Kokosmilch und Naan" },
  { id: "w8", name: "Köfte mit Bulgur", category: "Halal", description: "Gegrillte Hackfleischbällchen mit Bulgursalat und Joghurt" },
  { id: "w9", name: "Kürbisrisotto", category: "Vegetarisch", description: "Cremiges Risotto mit Hokkaido-Kürbis und Parmesan" },
  { id: "w10", name: "Pad Thai", category: "Vegan", description: "Gebratene Reisnudeln mit Tofu, Sprossen und Erdnüssen" },
];

const categoryColor: Record<string, string> = {
  Vegan: "bg-green-100 text-green-700",
  Vegetarisch: "bg-lime-100 text-lime-700",
  Halal: "bg-blue-100 text-blue-700",
};

function getNextMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
}

export default function Abstimmung() {
  const { isLoggedIn } = useUser();
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votedIds, setVotedIds] = useState<string[]>([]);

  useEffect(() => {
    votesApi.counts().then(setVotes).catch(() => {});
    if (isLoggedIn) votesApi.myVotes().then(setVotedIds).catch(() => {});
  }, [isLoggedIn]);

  const handleVote = async (id: string) => {
    if (!isLoggedIn || votedIds.includes(id)) return;
    try {
      const res = await votesApi.cast(id);
      if (res.counts) setVotes(res.counts);
      if (res.votedIds) setVotedIds(res.votedIds);
    } catch {}
  };

  const totalVotes = Object.values(votes).reduce((s, v) => s + v, 0);
  const maxVotes = Math.max(1, ...Object.values(votes));
  const sorted = [...WISH_DISHES].sort((a, b) => (votes[b.id] ?? 0) - (votes[a.id] ?? 0));
  const remainingVotes = WISH_DISHES.length - votedIds.length;

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <header className="bg-[#003a70] text-white p-6 shadow-lg">
        <h1 className="text-2xl mb-1" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
          Wunschgericht-Voting
        </h1>
        <p className="text-blue-100 text-sm">Bestimme den Speiseplan der kommenden Woche</p>
      </header>

      {/* Info bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Für Woche ab <strong className="text-gray-700">{getNextMonday()}</strong></span>
        </div>
        <div className="text-xs text-gray-400">{totalVotes} Stimmen gesamt</div>
      </div>

      {/* Login gate */}
      {!isLoggedIn && (
        <div className="mx-4 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Zum Abstimmen bitte <strong>anmelden</strong>. Die Ergebnisse sind für alle sichtbar.
          </p>
        </div>
      )}

      {isLoggedIn && (
        <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
          <p className="text-xs text-blue-700">
            <strong>{votedIds.length}</strong> von {WISH_DISHES.length} bewertet
          </p>
          {remainingVotes > 0 ? (
            <span className="text-xs text-blue-500">{remainingVotes} verbleibend</span>
          ) : (
            <span className="text-xs text-green-600 font-semibold">✓ Alle bewertet</span>
          )}
        </div>
      )}

      {/* Top 3 podium */}
      {totalVotes > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <p className="text-sm font-semibold text-gray-700" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
              Aktuelle Top 3
            </p>
          </div>
          <div className="space-y-2">
            {sorted.slice(0, 3).map((dish, i) => {
              const count = votes[dish.id] ?? 0;
              if (count === 0) return null;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={dish.id} className="flex items-center gap-3">
                  <span className="text-base">{medals[i]}</span>
                  <span className="text-sm text-gray-800 flex-1">{dish.name}</span>
                  <span className="text-xs font-semibold text-[#003a70]">{count} Stimme{count !== 1 ? "n" : ""}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dish list */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Alle Gerichte</p>
        {sorted.map((dish) => {
          const count = votes[dish.id] ?? 0;
          const voted = votedIds.includes(dish.id);
          const pct = count === 0 ? 0 : Math.round((count / maxVotes) * 100);
          const canVote = isLoggedIn && !voted;

          return (
            <div key={dish.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm mb-0.5" style={{ fontFamily: "'Variable Bold', 'Variable', sans-serif" }}>
                    {dish.name}
                  </p>
                  <p className="text-xs text-gray-500 mb-1.5">{dish.description}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[dish.category]}`}>
                    {dish.category}
                  </span>
                </div>
                <button
                  onClick={() => handleVote(dish.id)}
                  disabled={!canVote}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    voted
                      ? "bg-[#003a70] text-white cursor-default"
                      : canVote
                      ? "bg-gray-100 text-gray-700 hover:bg-[#003a70] hover:text-white"
                      : "bg-gray-100 text-gray-400 cursor-default"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {voted ? "Abgestimmt" : "Stimmen"}
                </button>
              </div>

              {/* Vote bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${voted ? "bg-[#003a70]" : "bg-gray-300"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-14 text-right">
                  {count} Stimme{count !== 1 ? "n" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
