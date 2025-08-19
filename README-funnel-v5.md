# Funnel v5 — Clubselectie & Dossiers

## Wat is nieuw
- **Selecteer vereniging uit database** ( `data/clubs.json` ) bij het aanmaken/bewerken van trajecten.
  - We slaan **clubId** + **clubnaam** op in het traject.
  - Vrije tekst blijft mogelijk; geen clubId = niet gekoppeld.
- **Filters** uitgebreid: filter op **clubId** via dezelfde lijst.
- **Dossierpagina** `club-dossier.html`: alle trajecten van één club met totalen (begroot, subsidie, eigen, restant).
  - Vanuit het overzicht klik je op de clubnaam om het dossier te openen.
- **CSV** export bevat **clubId** kolom.

## Hoe de 'database' werkt (GitHub-only)
- Bewaar je verenigingen in `data/clubs.json` (zie meegeleverd voorbeeld). GitHub Pages serveert dit bestand statisch.
- Wil je importeren vanuit je CRM? Genereer een `clubs.json` export met velden:
  ```json
  [{"id":"club-123","naam":"SV Voorbeeld","plaats":"Utrecht","sport":"Voetbal"}, ...]
  ```
  Let op: ids moeten **stabiel/unik** zijn.

## Integratie met een echt CRM (optie)
- Vervang `fetch('data/clubs.json')` door een `fetch()` naar je CRM/API (via een **serverless proxy** om secrets te verbergen).
- Map de velden naar `{id, naam, plaats, sport}` en zorg dat `CORS`/auth geregeld is.

## Installatie
1. Plaats/merge deze bestanden in je repo root:
   - `funnel.html`, `funnel.js`, `club-dossier.html`
   - `data/clubs.json` (voorbeeld; vervang met jouw export)
2. Commit naar **main** en open de Pages-URL.
