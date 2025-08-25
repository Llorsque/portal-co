
import { requireAuth, attachLogout, getJSON, setJSON, escapeHtml, uid, daysSince } from './core.js';
const s=requireAuth(); attachLogout();
const storageKey='club_portal_funnel_v6'; // behoud data continuïteit
function getData(){return getJSON(storageKey,[])} function setData(r){setJSON(storageKey,r)}

const SUPPORTERS = ["Aimee", "Allard", "Birgitta", "Demi", "Jorick", "Justin", "Marvin", "Rainer", "Sybren", "Tjardo"];
const SUPPORTER_COLORS = {
  'Aimee':'#FF3B30','Allard':'#6C8EFF','Birgitta':'#AF52DE','Demi':'#FFC857','Jorick':'#34C759','Justin':'#4C8BF5','Marvin':'#30D158','Rainer':'#FF8A00','Sybren':'#50C8E8','Tjardo':'#8E8E93'
};

let CLUBS = [];
async function loadClubs(){
  try{ const res=await fetch('data/clubs.json',{cache:'no-store'}); CLUBS = res.ok?await res.json():[]; } catch { CLUBS=[]; }
  const dl=document.getElementById('clubsList'); if(!dl) return; dl.innerHTML='';
  CLUBS.forEach(c=>{const o=document.createElement('option'); o.value=`${c.id} — ${c.naam}`; dl.appendChild(o);});
}

// Filters
const fType = document.getElementById('fType');
const fStage = document.getElementById('fStage');
const fClubId = document.getElementById('fClubId');
const fClubName = document.getElementById('fClubName');
const fClubSupp = document.getElementById('fClubSupp');
const fCoach = document.getElementById('fCoach');
const fStartFrom = document.getElementById('fStartFrom');
const fStartTo = document.getElementById('fStartTo');

const tiles = document.getElementById('metricTiles');
const listBody = document.querySelector('#listTable tbody');

function withinDateRange(d){
  if(!d) return true;
  const x = new Date(d).getTime();
  const a = fStartFrom.value ? new Date(fStartFrom.value).getTime() : -Infinity;
  const b = fStartTo.value ? new Date(fStartTo.value).getTime() : Infinity;
  return x >= a && x <= b;
}

function filtered(items){
  const idSel = (fClubId.value||'').split(' — ')[0];
  return items.filter(it=>(
    (!fType.value || it.typeTraject===fType.value) &&
    (!fStage.value || it.stage===fStage.value) &&
    (!idSel || it.clubId===idSel) &&
    (!fClubName.value || String(it.vereniging||'').toLowerCase().includes(fClubName.value.toLowerCase())) &&
    (!fClubSupp.value || it.clubondersteuner===fClubSupp.value) &&
    (!fCoach.value || String(it.trajectbegeleider||'').toLowerCase().includes(fCoach.value.toLowerCase())) &&
    withinDateRange(it.startDate)
  ));
}

function durationDays(start, end){
  if(!start || !end) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e)) return null;
  const diff = Math.max(0, Math.round((e - s) / (1000*60*60*24)));
  return diff;
}

function fmtMoney(n){
  const x = Number(n || 0);
  return x.toLocaleString('nl-NL', { style:'currency', currency:'EUR' });
}
const num=n=>Number(n||0);
function derive(r){
  const budget=num(r.costBudget);
  const subPct=Math.min(100,Math.max(0,num(r.financingPct)));
  const ownPct=Math.min(100,Math.max(0,num(r.ownPct)));
  const subAmt=Math.round(budget*subPct)/100;
  const ownAmt=Math.round(budget*ownPct)/100;
  const coveredPct=Math.min(100,subPct+ownPct);
  const coveredAmt=Math.min(budget,subAmt+ownAmt);
  const residualAmt=Math.max(0,budget-coveredAmt);
  return {budget,subPct,ownPct,subAmt,ownAmt,coveredPct,residualAmt};
}

function computeMetrics(rows){
  const total = rows.length;
  const durations = rows.map(r=>durationDays(r.startDate, r.endDateExpected)).filter(v=>typeof v==='number');
  const avg = durations.length ? Math.round(durations.reduce((a,b)=>a+b,0)/durations.length) : 0;
  const median = durations.length ? durations.sort((a,b)=>a-b)[Math.floor(durations.length/2)] : 0;

  let budgetSum=0, ownSum=0, subSum=0, residSum=0;
  let subLocal=0, subOther=0;
  const byType = ['CKC','Rabo Clubsupport','Verenigingsmanager','Verduurzaming'].map(t=>({type:t, count: rows.filter(r=>r.typeTraject===t).length}));

  for(const r of rows){
    const d = derive(r);
    budgetSum += d.budget;
    ownSum += d.ownAmt;
    subSum += d.subAmt;
    residSum += d.residualAmt;
    if ((r.financingType||'').toLowerCase().includes('lokaal')) subLocal += d.subAmt;
    else if ((r.financingType||'').toLowerCase().includes('overige')) subOther += d.subAmt;
  }
  return { total, byType, avg, median, budgetSum, subSum, ownSum, residSum, subLocal, subOther };
}

function renderMetrics(rows){
  const m = computeMetrics(rows);
  tiles.innerHTML = "";
  const el = (title, value, sub=null, icon='📊')=>{
    const a = document.createElement('div');
    a.className = 'tile'; a.style.alignItems='flex-start';
    a.innerHTML = `<div class="icon">${icon}</div><div><h3>${escapeHtml(title)}</h3><p><strong>${escapeHtml(String(value))}</strong>${sub?`<br><span class="small">${escapeHtml(sub)}</span>`:''}</p></div>`;
    return a;
  };
  tiles.appendChild(el('Totaal trajecten (filter)', m.total));
  tiles.appendChild(el('Begroot totaal', fmtMoney(m.budgetSum), null, '💶'));
  tiles.appendChild(el('Subsidie totaal', fmtMoney(m.subSum), `LSA: ${fmtMoney(m.subLocal)} • Overige: ${fmtMoney(m.subOther)}`, '🏛️'));
  tiles.appendChild(el('Eigen bijdrage totaal', fmtMoney(m.ownSum), null, '👥'));
  tiles.appendChild(el('Restant (onbekend/overig)', fmtMoney(m.residSum), null, '❓'));
  tiles.appendChild(el('Gemiddelde duur (dagen, gepland)', m.avg, `Mediaan: ${m.median}`, '⏱️'));
  m.byType.forEach(x=>tiles.appendChild(el(`${x.type}`, x.count, null, '🧩')));
}

function colorBadge(name){
  const c=SUPPORTER_COLORS[name]||'#666';
  return `<span class="badge" style="background:${c}20;border-color:${c};color:${c}">${escapeHtml(name)}</span>`;
}

function renderList(rows){
  listBody.innerHTML = "";
  rows.forEach(r=>{
    const d = derive(r);
    const dur = durationDays(r.startDate, r.endDateExpected);
    const dossierLink = r.clubId ? `club-dossier.html?clubId=${encodeURIComponent(r.clubId)}` : '#';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.clubId?`<a href="${dossierLink}">${escapeHtml(r.vereniging||"")}</a>`:escapeHtml(r.vereniging||"")}</td>
      <td>${escapeHtml(r.typeTraject||"")}</td>
      <td>${escapeHtml(r.stage||"")}</td>
      <td>${colorBadge(r.clubondersteuner||"-")}</td>
      <td>${escapeHtml(r.trajectbegeleider||"")}</td>
      <td>${r.startDate?new Date(r.startDate).toLocaleDateString():"—"}</td>
      <td>${r.endDateExpected?new Date(r.endDateExpected).toLocaleDateString():"—"}</td>
      <td>${dur??"—"}</td>
      <td>${fmtMoney(r.costBudget)}}</td>
      <td>${escapeHtml(r.financingType||"")}</td>
      <td>${(d.subPct||0).toFixed(1)}%</td>
      <td>${fmtMoney(d.subAmt)}}</td>
      <td>${(d.ownPct||0).toFixed(1)}%</td>
      <td>${fmtMoney(d.ownAmt)}}</td>
      <td>${d.coveredPct.toFixed(1)}%</td>
      <td>${fmtMoney(d.residualAmt)}}</td>
    `;
    listBody.appendChild(tr);
  });
}

function renderBoard(){
  document.querySelectorAll('.dropzone').forEach(z=>z.innerHTML="");
  const rows = getData();
  const alerts=[];
  for(const r of rows){
    const d = derive(r);
    const start = r.startDate ? new Date(r.startDate).toLocaleDateString() : "—";
    const end   = r.endDateExpected ? new Date(r.endDateExpected).toLocaleDateString() : "—";
    const club = r.vereniging || "(onbekende vereniging)";
    const card=document.createElement('div'); card.className='card-item'; card.draggable=true; card.dataset.id=r.id;
    const supp=colorBadge(r.clubondersteuner||'-');
    card.innerHTML = `
      <div class="title">${escapeHtml(club)}</div>
      <div class="small">${escapeHtml(r.typeTraject || "")}</div>
      <div class="badges">
        <span class="badge">Start: ${start}</span>
        <span class="badge">Einde: ${end}</span>
        ${supp}
        <span class="badge">Begeleider: ${escapeHtml(r.trajectbegeleider||"-")}</span>
        ${r.financingType ? `<span class="badge">${escapeHtml(r.financingType)}: ${(d.subPct||0).toFixed(1)}%</span>` : ''}
        ${d.ownPct>0 ? `<span class="badge">Eigen: ${d.ownPct.toFixed(1)}%</span>` : ''}
        ${daysSince(r.lastUpdate)>=7 && r.stage!=="afgerond" ? '<span class="badge warn">⚠ >7 dagen stil</span>' : ''}
        ${r.stage==="afgerond" ? '<span class="badge ok">✓ klaar</span>' : ''}
      </div>
    `;
    card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',r.id)});
    card.addEventListener('click',()=>openModal(r.id));
    const zone=document.querySelector(`.dropzone[data-stage="${r.stage}"]`); if(zone) zone.appendChild(card);
    if(daysSince(r.lastUpdate)>=7 && r.stage!=="afgerond") alerts.push(r);
  }
  const alertsBox=document.getElementById('alertsBox'), alertsRows=document.getElementById('alertsRows');
  if(alerts.length){
    alertsBox.classList.remove('hidden'); alertsRows.innerHTML="";
    for(const a of alerts){const row=document.createElement('div'); row.className='row'; row.innerHTML=`<div><strong>${escapeHtml(a.vereniging)}</strong> — ${escapeHtml(a.typeTraject)} <span class="small">(geen update sinds ${daysSince(a.lastUpdate)} dagen)</span></div><div><button class="ok" data-id="${a.id}" data-action="touch">Markeer geüpdatet</button><button class="ghost" data-id="${a.id}" data-action="open">Open</button></div>`; alertsRows.appendChild(row);}
    alertsRows.addEventListener('click',e=>{ const id=e.target.dataset.id, act=e.target.dataset.action; if(!id||!act) return; const rows=getData(); const idx=rows.findIndex(x=>x.id===id); if(idx<0) return; if(act==='touch'){ rows[idx].lastUpdate=new Date().toISOString().slice(0,10); setData(rows); renderBoard(); recalc(); } if(act==='open') openModal(id); });
  } else alertsBox.classList.add('hidden');
}

function recalc(){
  const rows = filtered(getData());
  renderMetrics(rows);
  renderList(rows);
}

function setupDnD(){
  document.querySelectorAll('.dropzone').forEach(zone=>{
    zone.addEventListener('dragover',e=>e.preventDefault());
    zone.addEventListener('drop',e=>{
      e.preventDefault();
      const id=e.dataTransfer.getData('text/plain'); const stage=zone.dataset.stage;
      const rows=getData(); const i=rows.findIndex(x=>x.id===id); if(i<0) return;
      rows[i].stage=stage; setData(rows);
      renderBoard(); recalc();
    });
  });
}

function bindClubPicker(form){
  const input = form.querySelector('#clubPicker');
  const hidden = form.querySelector('input[name="clubId"]');
  input.addEventListener('change', ()=>{
    const val = input.value;
    const hit = CLUBS.find(c => (`${c.id} — ${c.naam}`).toLowerCase() === val.toLowerCase() || c.naam.toLowerCase() === val.toLowerCase() || c.id.toLowerCase() === val.toLowerCase());
    if(hit){ hidden.value = hit.id; input.value = hit.naam; }
    else { hidden.value = ""; }
  });
}

function openModal(id=null){
  const modal=document.getElementById('cardModal'); const form=document.getElementById('cardForm'); const title=document.getElementById('modalTitle'); modal.classList.add('show');
  const rows=getData();
  let data={
    id: uid(), clubId:"", vereniging:"", typeTraject:"", clubondersteuner:"", trajectbegeleider:"",
    startDate:"", endDateExpected:"", costBudget:"",
    financingType:"", financingPct:"", financingAmount:"",
    ownPct:"", ownAmount:"",
    stage:"intake", notes:"", lastUpdate:new Date().toISOString().slice(0,10)
  };
  if(id){ const idx=rows.findIndex(x=>x.id===id); if(idx>=0) data=rows[idx]; }
  for(const [k,v] of Object.entries(data)){ const el=form.querySelector(`[name="${k}"]`); if(el) el.value = v ?? ""; }
  title.textContent = id ? "Traject bewerken" : "Nieuw traject";
  bindClubPicker(form);

  const costBudget = form.querySelector('#costBudget');
  const financingPct = form.querySelector('#financingPct');
  const financingAmount = form.querySelector('#financingAmount');
  const ownPct = form.querySelector('#ownPct');
  const ownAmount = form.querySelector('#ownAmount');
  const coverageInfo = document.getElementById('coverageInfo');

  function recompute(){
    const budget = Number(costBudget.value || 0);
    const subPct = Math.min(100, Math.max(0, Number(financingPct.value || 0)));
    const ownP = Math.min(100, Math.max(0, Number(ownPct.value || 0)));
    const subAmt = Math.round((budget * subPct)) / 100;
    const ownAmt = Math.round((budget * ownP)) / 100;
    financingAmount.value = subAmt.toFixed(2);
    ownAmount.value = ownAmt.toFixed(2);
    const coveredPct = Math.min(100, subPct + ownP);
    const residualPct = Math.max(0, 100 - coveredPct);
    const coveredAmt = Math.min(budget, subAmt + ownAmt);
    const residualAmt = Math.max(0, budget - coveredAmt);
    const warn = (subPct + ownP) > 100 ? "⚠ som % > 100" : "";
    coverageInfo.textContent = `Dekking: ${coveredPct.toFixed(1)}% (${coveredAmt.toFixed(2)} EUR) • Restant: ${residualPct.toFixed(1)}% (${residualAmt.toFixed(2)} EUR) ${warn}`.trim();
  }
  [costBudget, financingPct, ownPct].forEach(el=>el.addEventListener('input', recompute));
  recompute();

  form.onsubmit=(e)=>{
    e.preventDefault();
    const fd=new FormData(form);
    const obj=Object.fromEntries(fd.entries());
    if(!obj.lastUpdate) obj.lastUpdate = new Date().toISOString().slice(0,10);
    const list = getData();
    const idx = list.findIndex(x=>x.id===obj.id);
    if(idx>=0) list[idx]=obj; else list.push(obj);
    setData(list);
    modal.classList.remove('show');
    renderBoard(); recalc();
  };
  document.getElementById('cancelModalBtn').onclick=()=> modal.classList.remove('show');
}

document.getElementById('addCardBtn').addEventListener('click',()=>openModal(null));
document.getElementById('exportFunnelBtn').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(getData(),null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`funnel-v7b-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});
document.getElementById('clearFunnelBtn').addEventListener('click',()=>{ if(confirm('Alles wissen?')){ setData([]); renderBoard(); recalc(); } });
document.getElementById('exportCsvBtn').addEventListener('click',()=>{
  const rows = filtered(getData());
  const headers = ["id","clubId","vereniging","typeTraject","stage","clubondersteuner","trajectbegeleider","startDate","endDateExpected","plannedDurationDays","costBudget","financingType","financingPct","financingAmount","ownPct","ownAmount","lastUpdate","notes"];
  const csv = [headers.join(",")].concat(rows.map(r=>{
    const vals = { ...r, plannedDurationDays: (function(){ const s=r.startDate,e=r.endDateExpected; if(!s||!e) return ""; const S=new Date(s).getTime(), E=new Date(e).getTime(); if(isNaN(S)||isNaN(E)) return ""; return Math.max(0, Math.round((E-S)/(1000*60*60*24))); })() };
    return headers.map(h=>`"${String(vals[h]??"").replaceAll('"','""')}"`).join(",");
  })).join("\n");
  const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`funnel-export-${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

// Init
async function init(){
  await loadClubs();
  renderBoard();
  setupDnD();
  [fType,fStage,fClubId,fClubName,fClubSupp,fCoach,fStartFrom,fStartTo].forEach(el=>el.addEventListener('input', recalc));
  recalc();
}
init();
