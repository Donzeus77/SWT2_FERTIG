# Mensen-App — Backend

Express-Server ohne externe Datenbank. Daten werden als JSON-Dateien in `server/data/` gespeichert.

## Setup

```bash
cd server
npm install
```

Umgebungsvariablen anlegen:

```bash
cp ../.env.example .env
# JWT_SECRET anpassen!
```

## Starten

```bash
# Entwicklung (mit Auto-Reload)
npm run dev

# Produktion
npm start
```

Der Server läuft auf **http://localhost:3001**.

## Endpunkte

| Methode | Pfad | Auth | Beschreibung |
|---------|------|------|--------------|
| POST | `/api/auth/register` | – | Registrierung |
| POST | `/api/auth/login` | – | Login → JWT |
| GET | `/api/auth/me` | ✓ | Eigenes Profil |
| GET | `/api/menu/:date` | – | Tagesmenü (YYYY-MM-DD) |
| GET | `/api/menu/week/:monday` | – | Wochenmenü |
| GET | `/api/orders` | ✓ | Meine Bestellungen |
| POST | `/api/orders` | ✓ | Bestellung erstellen |
| PATCH | `/api/orders/:id` | ✓ | Status ändern |
| GET | `/api/votes` | – | Stimmenanzahl |
| GET | `/api/votes/my` | ✓ | Eigene Stimmen |
| POST | `/api/votes/:dishId` | ✓ | Abstimmen |
| GET | `/api/mensas` | – | Alle Standorte |

## Auf echte Datenbank umsteigen

Nur `server/db.ts` austauschen — alle Route-Files bleiben unverändert.

**PostgreSQL (z.B. mit `pg`):**
```ts
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

**SQLite (mit `better-sqlite3`):**
```ts
import Database from "better-sqlite3";
const db = new Database("mensen.db");
```

## Deployment (Railway / Render)

1. `server/` in eigenes GitHub-Repo pushen (oder Monorepo)
2. `npm start` als Start-Befehl setzen
3. Umgebungsvariablen im Dashboard eintragen
4. `VITE_API_URL` im Frontend auf die Deploy-URL setzen
