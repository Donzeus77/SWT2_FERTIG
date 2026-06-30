package com.example.mensa_app_backend.profil;

public class Profil {
    private static int anzahlNutzer = 0;
    private long id;
    private String email;
    private String passwort;
    private String vorname;
    private String nachname;
    private String status;

    // Konstruktor fuer Gaeste
    public Profil(String email, String passwort, String vorname, String nachname) {
        this.email = email;
        this.vorname = vorname.substring(0,1).toUpperCase() + vorname.substring(1);;
        this.nachname = nachname.substring(0,1).toUpperCase() + nachname.substring(1);;
        this.passwort = passwort;
        status = "gast";
        id = ++anzahlNutzer;
    }

    // Konstruktor fuer Studenten und Mitarbeiter
    public Profil(String email, String passwort) {
        this.email = email;
        this.passwort = passwort;
        status = ermittleStatus(email);
        id = ++anzahlNutzer;
        extrahiereName(email);
    }

    public static String ermittleStatus(String email) {
        if(email.contains("@stud.fh-dortmund.de")) {    // vorname.nachname000@stud.fh-dortmund.de
            return "student";
        } else if(email.contains("@fh-dortmund.de")) {  // vorname.nachname@fh-dortmund.de
            return "mitarbeiter";
        } else {                                        // irgendwas@seite.de
            return "gast";
        }
    }

    private void extrahiereName(String email) {
        String[] name = email.split("@")[0].split("\\.");     // vorname.nachname000 -> ["vorname","nachname000"]
        String vorname = name[0].substring(0,1).toUpperCase() + name[0].substring(1);
        String nachname = name[1].substring(0,1).toUpperCase() + name[1].substring(1);
        if(status.equals("student") && nachname.length() >= 3) {
            nachname = nachname.substring(0, nachname.length()-3);   // nachname000 -> nachname
        }
        this.vorname = vorname;
        this.nachname = nachname;
    }

    @Override
    public String toString() {
        return("Vorname: " + vorname + " Nachname: " + nachname + " Status: " + status.substring(0,1).toUpperCase() + status.substring(1));
    }

}