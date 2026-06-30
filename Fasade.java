public class Fasade {
    // 1. Abhängigkeiten definieren
    private Profil profil;
    private Voting voting;
    private MenuGetter menuGetter;
    private Authentizierung authentizierung;

    // 2. Konstruktor (Subsysteme initialisieren)
    public Fasade() {
        this.profil = new Profil();
        this.voting = new Voting();
        this.menuGetter = new MenuGetter();
        this.authentizierung = new Authentizierung();
    }

    // 3. Vereinfachte Methoden für dein Display
    public boolean loginAusfuehren(String username, String passwort) {
        // Leitet die Arbeit an das Subsystem weiter
        return this.authentizierung.pruefeLogindaten(username, passwort); 
    }

    public void gerichtVoten(Gericht gericht, int sterne) {
        this.voting.registriereStimme(gericht, sterne);
    }

    public void userProfilAktualisieren(String neuerName) {
        this.profil.setName(neuerName);
        // Hier könnte man später noch automatisch ein "Speichern in DB" triggern
    }
}