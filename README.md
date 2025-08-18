
# Club Portal (Prototype) — GitHub Pages (BUILD v0.2-full)

**Doel:** visueel en functioneel ontdekken wat werkt. Dit is geen productie, alleen een **client-side demo** met fake login, formulier, admin-overview, status & notities, eigen inzendingen bewerken en AVG-toestemming.

## Snel aan de slag
1. Nieuwe GitHub-repo (bijv. `club-portal-proto`).  
2. Upload de 4 bestanden in de **root** van branch **main**.  
3. **Settings → Pages → Source: Deploy from a branch → Branch: `main` / Folder: `/ (root)` → Save.**  
4. Open de Pages-URL en log in met `admin/admin123` of `demo/demo123`.

**Tip:** Forceer een refresh met `Ctrl/Cmd + Shift + R` als je een oude versie ziet.

## Wat zit erin?
- Formulier: Voornaam, Achternaam, Vereniging, Hulpvraag, E-mail, Telefoon, Thema, AVG consent.
- Admin: zoeken, status (Nieuw/In behandeling/Afgerond), notities, opslaan, verwijderen, CSV export, alles wissen.
- Gebruiker: eigen inzendingen zien, bewerken en verwijderen.

## Volgende stap “Strict GitHub Only” (centrale opslag zonder externe DB)
Gebruik een kleine serverless functie (Cloudflare/Netlify/Azure) die met een **GitHub token** inzendingen als JSON commit naar je repo. Frontend doet `fetch` naar die functie. Ik kan je daar kant-en-klare code voor geven.
