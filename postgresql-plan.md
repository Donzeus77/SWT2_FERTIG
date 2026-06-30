# PostgreSQL-Datenbankanbindung — Plan (bestehende Dateien anpassen)

## Prinzip

Bestehende Dateien werden **wo möglich angepasst**, neue Dateien nur dort erzeugt, wo es unvermeidbar ist. Die einzigen komplett neuen Dateien sind `docker-compose.yml` und die Repository-Interfaces — alles andere sind Änderungen an vorhandenem Code.

> Betroffene Dateien: **~13 bestehende** werden geändert, **~8 neue** (docker-compose + Repositories)

---

## 1. Docker Compose (neue Datei — unvermeidbar)

`docker-compose.yml` im Root:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: postgres-swt2
    environment:
      POSTGRES_DB: mensadb
      POSTGRES_USER: mensa
      POSTGRES_PASSWORD: mensa123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

Start: `docker compose up -d`

---

## 2. Abhängigkeiten (bestehende pom.xml anpassen)

In `mensa_app_backend/pom.xml` und `studentenwerk_simulator/pom.xml` jeweils ergänzen:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

---

## 3. DataSource-Konfiguration (bestehende application.properties anpassen)

Statt neuer `DataSourceConfig.java`-Klassen werden die vorhandenen `application.properties` erweitert. Spring Boot Auto-Configuration erkennt die Properties und baut DataSource + EntityManager automatisch.

### `mensa_app_backend/src/main/resources/application.properties` erweitern:

```properties
# Bestehendes bleibt:
server.port=8082
spring.application.name=mensa_app_backend

# Neu — PostgreSQL:
spring.datasource.url=jdbc:postgresql://localhost:5432/mensadb
spring.datasource.username=mensa
spring.datasource.password=mensa123
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.properties.hibernate.default_schema=mensa_backend
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### `studentenwerk_simulator/src/main/resources/application.properties` erweitern:

```properties
# Bestehendes bleibt:
server.port=8081
spring.application.name=studentenwerk_simulator

# Neu — PostgreSQL:
spring.datasource.url=jdbc:postgresql://localhost:5432/mensadb
spring.datasource.username=mensa
spring.datasource.password=mensa123
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.properties.hibernate.default_schema=simulator
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## 4. JPA-Entities (bestehende Domain-Klassen um Annotationen erweitern)

Statt separater `db/*Entity.java`-Dateien werden die vorhandenen Klassen/Records mit JPA-Annotationen versehen.

### 4.1 mensa_app_backend

#### `MenuItem.java` (Record → Entity)
```java
@Entity
@Table(name = "menu_item")
public record MenuItem(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id,
    String name,
    String description,
    double price
) {}
```
Hinweis: Hibernate 6.x unterstützt Records als Entities. Schreibzugriffe erzeugen neue Instanzen (immutable).

#### `Order.java` (Record → Entity)
```java
@Entity
@Table(name = "customer_order")
public record Order(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id,
    Long menuItemId,
    String studentName,
    String status
) {}
```

#### `Profil.java` (Klasse → Entity)
Änderungen:
- `@Entity`, `@Table(name = "profil")` auf Klasse
- `@Id` auf `id`-Feld, `email` als natürlicher Schlüssel (`@Column(unique = true)`)
- Geschützter No-Arg-Konstruktor für JPA (zusätzlich zu den bestehenden)
- `static`-Counter entfernen (ID kommt von der Datenbank)
- `toString()` erbt von JPA-Proxy (bleibt oder wird angepasst)

```java
@Entity
@Table(name = "profil")
public class Profil {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @Column(unique = true)
    private String email;
    private String passwort;
    private String vorname;
    private String nachname;
    private String status;

    protected Profil() {} // JPA

    // bestehende Konstruktoren bleiben, angepasst:
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

    // ... bestehende Methoden bleiben ...
}
```

### 4.2 studentenwerk_simulator

#### `Meal.java` (Record → Entity)
```java
@Entity
@Table(name = "meal")
public record Meal(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id,
    String name,
    String category,
    double price
) {}
```

#### `ReceivedOrder.java` (Record → Entity)
```java
@Entity
@Table(name = "received_order")
public record ReceivedOrder(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id,
    Long menuItemId,
    String studentName,
    String status
) {}
```

#### `Gericht.java` (abstrakte Klasse → `@MappedSuperclass`)

Statt `@Entity` auf der Basisklasse (da abstrakt und mit Vererbung) wird `@MappedSuperclass` verwendet. Die `final`-Felder müssen für JPA nicht-final werden (oder es wird ein JPA-No-Arg-Konstruktor mit Default-Werten ergänzt — siehe Alternativ-Hinweis).

**Empfohlener Ansatz**: `@MappedSuperclass` + geschützter No-Arg-Konstruktor. Felder bleiben unverändert (Hibernate setzt sie per Reflection/Bytecode-Enhancement). Falls das nicht funktioniert: Felder nicht-final machen und Setter ergänzen.

```java
@MappedSuperclass
public abstract class Gericht {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;            // NEU — DB-ID

    private String name;
    private String beschreibung;
    private double preisStudent;
    private double preisGast;

    @ElementCollection
    @CollectionTable(name = "gericht_allergene")
    @Enumerated(EnumType.STRING)
    private Set<Allergen> allergene;

    @ElementCollection
    @CollectionTable(name = "gericht_tags")
    @Enumerated(EnumType.STRING)
    private Set<GerichtTag> tags;

    protected Gericht() {}      // NEU — für JPA

    // bestehender Konstruktor bleibt (angepasst: ID entfällt)
    protected Gericht(String name, String beschreibung,
            double preisStudent, double preisGast,
            Set<Allergen> allergene, Set<GerichtTag> tags) {
        this.name = name;
        this.beschreibung = beschreibung;
        this.preisStudent = preisStudent;
        this.preisGast = preisGast;
        this.allergene = allergene.isEmpty()
                ? Collections.emptySet()
                : Collections.unmodifiableSet(EnumSet.copyOf(allergene));
        this.tags = tags.isEmpty()
                ? Collections.emptySet()
                : Collections.unmodifiableSet(EnumSet.copyOf(tags));
    }

    // Getter bleiben, ggf. Setter ergänzen falls Felder nicht-final
    // ...
}
```

#### `Hauptspeise.java` (Entity)
```java
@Entity
@Table(name = "hauptspeise")
public class Hauptspeise extends Gericht {
    protected Hauptspeise() {}  // JPA

    public Hauptspeise(String name, String beschreibung,
            double preisStudent, double preisGast,
            Set<Allergen> allergene, Set<GerichtTag> tags) {
        super(name, beschreibung, preisStudent, preisGast, allergene, tags);
    }

    @Override
    public String getTyp() { return "Hauptspeise"; }
}
```

#### `Beilage.java` (Entity)
```java
@Entity
@Table(name = "beilage")
public class Beilage extends Gericht {
    protected Beilage() {}  // JPA

    public Beilage(String name, String beschreibung,
            double preisStudent, double preisGast,
            Set<Allergen> allergene, Set<GerichtTag> tags) {
        super(name, beschreibung, preisStudent, preisGast, allergene, tags);
    }

    @Override
    public String getTyp() { return "Beilage"; }
}
```

> **Alternative**: Falls `@MappedSuperclass` mit `final`-Feldern Probleme macht, kann `@Entity` + `@Inheritance(strategy = InheritanceType.SINGLE_TABLE)` auf `Gericht` verwendet werden. Dann brauchen die Felder aber Setter oder einen all-args-Konstruktor.

---

## 5. Repositories (neue Dateien — minimale Interfaces)

Im gleichen Package wie die Entities. Nur Interfaces, kein Implementierungscode:

```java
// mensa_app_backend
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {}
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(String status);
}
public interface ProfilRepository extends JpaRepository<Profil, Long> {
    Optional<Profil> findByEmail(String email);
}

// studentenwerk_simulator
public interface MealRepository extends JpaRepository<Meal, Long> {}
public interface ReceivedOrderRepository extends JpaRepository<ReceivedOrder, Long> {}
public interface GerichtRepository extends JpaRepository<Gericht, Long> {}
public interface HauptspeiseRepository extends JpaRepository<Hauptspeise, Long> {}
public interface BeilageRepository extends JpaRepository<Beilage, Long> {}
```

---

## 6. Services (bestehende Services anpassen – keine neuen *DbService-Dateien)

Statt separater `MenuDbService`, `OrderDbService` etc. werden die vorhandenen Services um DB-Unterstützung erweitert. Dafür wird Spring-Profile `"db"` verwendet.

Je nach aktivem Profil läuft der Service im In-Memory- oder DB-Modus. Controller müssen nicht geändert werden.

### Beispiel: `MenuService.java` (angepasst)

```java
@Service
@Profile("!db")  // In-Memory, wenn db-Profil NICHT aktiv
public class MenuService {
    // ... bestehender Code bleibt ...
}
```

```java
@Service
@Profile("db")   // DB, wenn db-Profil aktiv
public class MenuService {
    @Autowired private MenuItemRepository repo;

    public List<MenuItem> getAllItems() { return repo.findAll(); }
    public Optional<MenuItem> getItemById(Long id) { return repo.findById(id); }
    public MenuItem create(MenuItem item) { return repo.save(item); }
}
```

**Alternativer Ansatz** (eine Service-Klasse, beides in einer):

```java
@Service
public class MenuService {
    @Autowired(required = false)
    private MenuItemRepository repo;

    public List<MenuItem> getAllItems() {
        if (repo != null) return repo.findAll();
        return items;
    }
    // ...
}
```

Der Profil-Ansatz ist sauberer und wird empfohlen.

### Gleiches Schema für alle Services:

| Service-Datei | Änderung |
|---|---|
| `MenuService.java` | `@Profile("!db")` + Kopie mit `@Profile("db")` (oder bedingte Injektion) |
| `OrderService.java` | `@Profile("!db")` + Kopie mit `@Profile("db")` |
| `MealService.java` | `@Profile("!db")` + Kopie mit `@Profile("db")` |
| `ReceivedOrderService.java` | `@Profile("!db")` + Kopie mit `@Profile("db")` |

---

## 7. Übersicht: geänderte vs. neue Dateien

| Datei | Art | Beschreibung |
|---|---|---|
| `docker-compose.yml` | **neu** | PostgreSQL-Container |
| `mensa_app_backend/pom.xml` | **geändert** | +2 Deps |
| `studentenwerk_simulator/pom.xml` | **geändert** | +2 Deps |
| `mensa_app_backend/.../application.properties` | **geändert** | +6 Zeilen DB-Config |
| `studentenwerk_simulator/.../application.properties` | **geändert** | +6 Zeilen DB-Config |
| `menu/MenuItem.java` | **geändert** | `@Entity` + JPA-Annotationen |
| `order/Order.java` | **geändert** | `@Entity` + JPA-Annotationen |
| `profil/Profil.java` | **geändert** | `@Entity` + JPA-Annotationen + No-Arg-Constructor |
| `meal/Meal.java` | **geändert** | `@Entity` + JPA-Annotationen |
| `orderreceiver/ReceivedOrder.java` | **geändert** | `@Entity` + JPA-Annotationen |
| `gericht/Gericht.java` | **geändert** | `@MappedSuperclass` + ID-Feld + No-Arg-Constructor |
| `gericht/Hauptspeise.java` | **geändert** | `@Entity` + No-Arg-Constructor |
| `gericht/Beilage.java` | **geändert** | `@Entity` + No-Arg-Constructor |
| `menu/MenuService.java` | **geändert** | DB-Profil-Unterstützung |
| `order/OrderService.java` | **geändert** | DB-Profil-Unterstützung |
| `meal/MealService.java` | **geändert** | DB-Profil-Unterstützung |
| `orderreceiver/ReceivedOrderService.java` | **geändert** | DB-Profil-Unterstützung |
| `menu/MenuItemRepository.java` | **neu** | Spring Data Interface |
| `order/OrderRepository.java` | **neu** | Spring Data Interface |
| `profil/ProfilRepository.java` | **neu** | Spring Data Interface |
| `meal/MealRepository.java` | **neu** | Spring Data Interface |
| `orderreceiver/ReceivedOrderRepository.java` | **neu** | Spring Data Interface |
| `gericht/GerichtRepository.java` | **neu** | Spring Data Interface |
| `gericht/HauptspeiseRepository.java` | **neu** | Spring Data Interface |
| `gericht/BeilageRepository.java` | **neu** | Spring Data Interface |

**Fazit**: ~15 bestehende Dateien geändert, ~9 neue Dateien (vorher: ~16 neue, 2 geänderte).

Keine separaten `*Entity.java`-Dateien, keine separaten `*DbService.java`-Dateien, keine `DataSourceConfig.java`-Dateien.

---

## 8. Umsetzungsreihenfolge

1. `docker-compose.yml` erstellen & `docker compose up -d`
2. `pom.xml` — 2 Dep-Zeilen pro Modul
3. `application.properties` — DB-Config pro Modul
4. Entities vorbereiten (JPA-Annotationen an bestehenden Klassen/Records)
5. Repositories erstellen (neue Interfaces)
6. Services anpassen (`@Profile("db")` oder bedingte Injektion)
7. Start mit `--spring.profiles.active=db` testen
8. `./mvnw verify`

---

## Hinweise

- Ohne `--spring.profiles.active=db` läuft alles wie bisher In-Memory
- Mit `--spring.profiles.active=db` wird PostgreSQL verwendet
- Passwort gehört später in Umgebungsvariablen, nicht hartcodiert
- `spring.jpa.hibernate.ddl-auto=update` nur für Entwicklung — für Produktion auf `validate` oder `none`
- Records als Entities funktionieren mit Hibernate 6.x, haben aber Einschränkungen bei komplexen Beziehungen — für `ManyToOne` etc. ggf. doch auf Klasse umsteigen
- Falls `Gericht`-Vererbung mit `@MappedSuperclass` nicht sauber funktioniert: auf `@Inheritance(SINGLE_TABLE)` wechseln, dann `final`-Felder durch nicht-finale mit Settern ersetzen
