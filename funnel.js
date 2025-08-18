import { requireAuth, attachLogout, getJSON, setJSON, escapeHtml, uid, daysSince } from './core.js';
const s=requireAuth(); attachLogout();
const storageKey="club_portal_funnel_v2";
function getData(){return getJSON(storageKey,[])} function setData(r){setJSON(storageKey,r)}
const addBtn=document.getElementById('addCardBtn'); const exportBtn=document.getElementById('exportFunnelBtn'); const clearBtn=document.getElementById('clearFunnelBtn');
const alertsBox=document.getElementById('alertsBox'); const alertsRows=document.getElementById('alertsRows');

function render(){
  document.querySelectorAll('.dropzone').forEach(z=>z.innerHTML="");
  const rows=getData(); const alerts=[];
  for(const r of rows){
    const card=document.createElement('div'); card.className='card-item'; card.draggable=true; card.dataset.id=r.id;
    const start = r.startDate ? new Date(r.startDate).toLocaleDateString() : "—";
    const end   = r.endDateExpected ? new Date(r.endDateExpected).toLocaleDateString() : "—";
    card.innerHTML = `
      <div class="title">${escapeHtml(r.vereniging || "(onbekende vereniging)")}</div>
      <div class="small">${escapeHtml(r.typeTraject || "")}</div>
      <div class="badges">
        <span class="badge">Start: ${start}</span>
        <span class="badge">Einde: ${end}</span>
        <span class="badge">Clubondersteuner: ${escapeHtml(r.clubondersteuner||"-")}</span>
        <span class="badge">Begeleider: ${escapeHtml(r.trajectbegeleider||"-")}</span>
        ${daysSince(r.lastUpdate)>=7 && r.stage!=="afgerond" ? '<span class="badge warn">⚠ >7 dagen stil</span>' : ''}
        ${r.stage==="afgerond" ? '<span class="badge ok">✓ klaar</span>' : ''}
      </div>
    `;
    card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',r.id)});
    card.addEventListener('click',()=>openModal(r.id));
    const zone=document.querySelector(`.dropzone[data-stage="${r.stage}"]`); if(zone) zone.appendChild(card);
    if(daysSince(r.lastUpdate)>=7 && r.stage!=="afgerond") alerts.push(r);
  }
  if(alerts.length){alertsBox.classList.remove('hidden'); alertsRows.innerHTML=""; for(const a of alerts){const row=document.createElement('div'); row.className='row'; row.innerHTML=`<div><strong>${escapeHtml(a.vereniging)}</strong> — ${escapeHtml(a.typeTraject)} <span class="small">(geen update sinds ${daysSince(a.lastUpdate)} dagen)</span></div><div><button class="ok" data-id="${a.id}" data-action="touch">Markeer geüpdatet</button><button class="ghost" data-id="${a.id}" data-action="open">Open</button></div>`; alertsRows.appendChild(row);} } else {alertsBox.classList.add('hidden');}
}

function setupDnD(){document.querySelectorAll('.dropzone').forEach(zone=>{zone.addEventListener('dragover',e=>e.preventDefault()); zone.addEventListener('drop',e=>{e.preventDefault(); const id=e.dataTransfer.getData('text/plain'); const stage=zone.dataset.stage; moveCard(id,stage);});});}
function moveCard(id, stage){const rows=getData(); const i=rows.findIndex(x=>x.id===id); if(i<0) return; rows[i].stage=stage; setData(rows); render();}

function openModal(id=null){
  const modal=document.getElementById('cardModal'); const form=document.getElementById('cardForm'); const title=document.getElementById('modalTitle'); modal.classList.add('show');
  const rows=getData();
  let data={
    id: uid(),
    vereniging: "",
    typeTraject: "",
    clubondersteuner: "",
    trajectbegeleider: "",
    startDate: "",
    endDateExpected: "",
    stage: "intake",
    notes: "",
    lastUpdate: new Date().toISOString().slice(0,10)
  };
  if(id){ const idx=rows.findIndex(x=>x.id===id); if(idx>=0) data=rows[idx]; }
  for(const [k,v] of Object.entries(data)){ const el=form.querySelector(`[name="${k}"]`); if(el) el.value = v ?? ""; }
  title.textContent = id ? "Traject bewerken" : "Nieuw traject";
  form.onsubmit = (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const obj = Object.fromEntries(fd.entries());
    if(!obj.lastUpdate) obj.lastUpdate = new Date().toISOString().slice(0,10);
    const list = getData();
    const idx = list.findIndex(x=>x.id===obj.id);
    if(idx>=0) list[idx]=obj; else list.push(obj);
    setData(list);
    modal.classList.remove('show');
    render();
  };
  document.getElementById('cancelModalBtn').onclick = ()=> modal.classList.remove('show');
}

document.getElementById('addCardBtn').addEventListener('click',()=>openModal(null));
document.getElementById('exportFunnelBtn').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(getData(),null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`funnel-v2-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});
document.getElementById('clearFunnelBtn').addEventListener('click',()=>{ if(confirm('Alles wissen?')){ setData([]); render(); } });
document.getElementById('alertsRows').addEventListener('click',e=>{
  const id=e.target.dataset.id; const action=e.target.dataset.action; if(!id||!action) return;
  const rows=getData(); const idx=rows.findIndex(x=>x.id===id); if(idx<0) return;
  if(action==='touch'){ rows[idx].lastUpdate=new Date().toISOString().slice(0,10); setData(rows); render(); }
  if(action==='open'){ openModal(id); }
});

setupDnD(); render();
