# Club Portal + Funnel (Prototype) — GitHub Pages

**Inhoud**  
- `index.html` → Login + dashboard met twee tegels (Portal & Funnel)  
- `portal.html` → Formulieren + Admin-overview (status, notities, CSV)  
- `funnel.html` → Kanban funnel met drag & drop, signalen (>7 dagen geen update), modal voor bewerken  
- `styles.css` → UI-styling (brand kleuren)  
- `core.js` → gedeelde auth & utils  
- `portal.js`, `funnel.js` → modulelogica per pagina

> ⚠️ **Demo-only**: alle data in `localStorage`. Geen echte beveiliging. Perfect voor trial & error.

## Deploy via GitHub Pages
1. Nieuwe repo (bijv. `club-portal-funnel`).  
2. Upload alle bestanden in de **root** van branch **main**.  
3. **Settings → Pages** → *Deploy from a branch* → **Branch:** `main` / **Folder:** `/ (root)` → Save.  
4. Open de Pages-URL en log in met `admin/admin123` of `demo/demo123`.

## Volgende stap “Strict GitHub Only”
Serverless functie (Cloudflare/Netlify/Azure) met GitHub Token die JSON in de repo commit. Frontend doet `fetch()` naar de functie. Vraag gerust als je de code wilt.
