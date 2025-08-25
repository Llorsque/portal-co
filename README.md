# Friesland Clubs — 200 fictieve verenigingen (alfabetisch)

Dit pakket bevat `data/clubs.json` met 200 fictieve verenigingen uit Friesland.

## Gebruik in je portal (intake formulier)
Je bestaande funnel/portal kan de vereniging laten kiezen via een **datalist**:
- In je HTML staat: `<input id="clubPicker" list="clubsList">` + `<datalist id="clubsList"></datalist>`
- In je JS laad je `data/clubs.json`, sorteer je op `naam`, en vul je de datalist:
  ```js
  const res = await fetch('data/clubs.json', { cache: 'no-store' });
  const CLUBS = (await res.json()).sort((a,b)=>a.naam.localeCompare(b.naam,'nl'));
  const dl=document.getElementById('clubsList');
  dl.innerHTML='';
  CLUBS.forEach(c=>{ const o=document.createElement('option'); o.value = `${c.id} — ${c.naam}`; dl.appendChild(o); });
  ```
- Bij het **opslaan** sla je zowel `clubId` (bijv. `FR-023`) als `vereniging` (naam) op.

> In onze v7b-funnel is deze logica al aanwezig: `funnel.js` → `loadClubs()` en `bindClubPicker()`.

## Testen
Open `test-clubpicker.html` in dezelfde root als de map `data/`. Type om te zoeken, kies om te selecteren.

## Upload (TESTBRANCH!)
1) Schakel naar je testbranch (`dev`).  
2) Plaats/overschrijf `data/clubs.json` in de **root/data** map.  
3) Commit → bekijk je preview.  
4) Tevreden? PR `dev` → `main`.
