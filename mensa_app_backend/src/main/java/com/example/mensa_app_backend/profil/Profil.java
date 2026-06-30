package com.example.mensa_app_backend.profil;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "profil")
public class Profil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String passwort;
    private String vorname;
    private String nachname;
    private String status;

    protected Profil() {}

    public Profil(String email, String passwort, String vorname, String nachname) {
        this.email = email;
        this.vorname = Character.toUpperCase(vorname.charAt(0)) + vorname.substring(1);
        this.nachname = Character.toUpperCase(nachname.charAt(0)) + nachname.substring(1);
        this.passwort = passwort;
        this.status = "gast";
    }

    public Profil(String email, String passwort) {
        this.email = email;
        this.passwort = passwort;
        this.status = ermittleStatus(email);
        extrahiereName(email);
    }

    public static String ermittleStatus(String email) {
        if (email.contains("@stud.fh-dortmund.de")) {
            return "student";
        } else if (email.contains("@fh-dortmund.de")) {
            return "mitarbeiter";
        } else {
            return "gast";
        }
    }

    private void extrahiereName(String email) {
        String[] name = email.split("@")[0].split("\\.");
        String vorname = Character.toUpperCase(name[0].charAt(0)) + name[0].substring(1);
        String nachname = Character.toUpperCase(name[1].charAt(0)) + name[1].substring(1);
        if (status.equals("student") && nachname.length() >= 3) {
            nachname = nachname.substring(0, nachname.length() - 3);
        }
        this.vorname = vorname;
        this.nachname = nachname;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswort() { return passwort; }
    public void setPasswort(String passwort) { this.passwort = passwort; }
    public String getVorname() { return vorname; }
    public void setVorname(String vorname) { this.vorname = vorname; }
    public String getNachname() { return nachname; }
    public void setNachname(String nachname) { this.nachname = nachname; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "Vorname: " + vorname + " Nachname: " + nachname
                + " Status: " + Character.toUpperCase(status.charAt(0)) + status.substring(1);
    }
}