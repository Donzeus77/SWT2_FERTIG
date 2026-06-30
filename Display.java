public class Display {
    private Fasade systemFasade;

    public Display() {
        // Das Display holt sich den Manager
        this.systemFasade = new Fasade();
    }

    // Ein fiktiver Event-Handler für dein Figma-Login-Formular
    public void onLoginButtonClick(String userEingabe, String pwEingabe) {
        boolean loginErfolgreich = systemFasade.loginAusfuehren(userEingabe, pwEingabe);
        
        if (loginErfolgreich) {
            System.out.println("UI-Wechsel: Zeige Speiseplan!");
        } else {
            System.out.println("UI-Hinweis: Passwort falsch!");
        }
    }
}