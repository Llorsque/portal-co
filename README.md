
# Club Portal (Prototype) — GitHub Pages

**Doel:** visueel en functioneel ontdekken wat werkt. Dit is geen productie, alleen een **client-side demo** op GitHub Pages met **fake login**, **formulier**, **admin-overview**, **status + notities**, **eigen inzendingen bewerken** en **AVG-toestemming**.

> ⚠️ **Belangrijk:** Alles draait 100% in de browser via `localStorage`. Geen echte beveiliging, geen server, geen gedeelde dataset tussen apparaten/gebruikers. Perfect om te testen, niet om echte data te verzamelen.

## Snel aan de slag
1. Maak een nieuwe GitHub-repo, bijvoorbeeld **`club-portal-proto`**.
2. Upload deze vier bestanden in de **root** van de repo (branch **main**):
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
3. Zet **GitHub Pages** aan:
   - Ga naar **Settings → Pages**.
   - **Source:** *Deploy from a branch*.
   - **Branch:** `main` en **Folder:** `/ (root)`.
   - Sla op. Wacht tot de deployment klaar is; de Pages URL verschijnt bovenaan dit scherm.
4. Open de Pages-URL en test met de **demo-accounts**:
   - **Admin:** `admin` / `admin123` → overzichtstabel, CSV-export, status/notities, wissen.
   - **Gebruiker:** `demo` / `demo123` → formulier + eigen inzendingen bewerken.

## Wat zit erin?
- **Login (demo):** `admin` ziet admin-overview, `demo` ziet het formulier en eigen inzendingen.
- **Formulier (vereniging):** Voornaam, Achternaam, Vereniging, Hulpvraag + drie extra verplichte velden **E‑mail**, **Telefoon**, **Thema**.
- **AVG-toestemming:** verplichte checkbox (testgevoel).
- **Admin-overview:** zoeken, per rij **Status** (`Nieuw` / `In behandeling` / `Afgerond`) en **Notities**, **Opslaan**, **Verwijderen**, **Export CSV**, **Alles wissen**.
- **Eigen inzendingen:** ingelogde gebruiker ziet en kan **bewerken**/**verwijderen** (client-side).

## Veelgestelde vraag: “Strict GitHub Only” voor een echte MVP — wat is dat?
Zonder externe diensten kun je tóch data centraal opslaan door **een kleine serverless functie** te gebruiken die naar je **GitHub-repo** schrijft via de **GitHub API** (bijv. als JSON-bestanden of als GitHub Issues). De webpagina (GitHub Pages) doet dan een **POST** naar die functie. De functie commit vervolgens data in je repo.

### Hoe werkt dat op hoofdlijnen?
- **Frontend (deze pagina):** verstuurt formulierdata naar een endpoint (bijv. Cloudflare Worker, Netlify Function, Azure Function — klein, goedkoop/gratis).
- **Serverless functie:** heeft een **GitHub Personal Access Token (secret)**. Schrijft de payload naar je repo:
  - optie A: als nieuw bestand in `/data/2025-...json`
  - optie B: als **GitHub Issue** (handig voor triage/status, maar minder gestructureerd)
- **Voordelen:** je houdt alles binnen GitHub (versiebeheer, audit trail, PR’s, exports).
- **Nadelen:** vereist 1x setup van een serverless omgeving en secrets. Niet realtime, maar meestal snel genoeg.

> Wil je dit pad? Dan lever ik je een kant-en-klare serverless functie + aanpassingen in `app.js` (fetch naar endpoint) voor een proof-of-concept. Dit is nog steeds simpel en goed te overzien.

## Alternatief: Supabase/Firebase (sneller klaar)
- Auth, database en API out-of-the-box. Sneller voor echte login, centraal opslaan en query’s.
- Minder “GitHub-only”, maar erg fijn voor een MVP. Ook hier kan ik je starterbestanden en schema’s geven.

## Beperkingen van dit prototype
- Geen echte beveiliging of multi-user opslag.
- Wie de pagina opent, kan in DevTools de data bekijken/wijzigen (testfase!).
- Voor productie heb je **echte auth** (OAuth/magic link) en **centrale opslag** nodig + **AVG** (privacyverklaring, bewaartermijnen, verwerkersovereenkomsten).

## Aanpassen
- Pas demo-accounts aan in `app.js` (`DEMO_USERS`).
- Velden uitbreiden: voeg `<label>`-blokken toe in `index.html` en breid `exportCsv()`/`renderTable()` uit in `app.js`.
- Styling: `styles.css` gebruikt jouw kleuren (#212945 / #52E8E8).

Veel plezier met testen! ✨
