
import { requireAuth, attachLogout, getJSON, setJSON, escapeHtml, uid } from './core.js';
requireAuth(); attachLogout();

const storageKey='club_portal_funnel_v7';
const supporters = ["Aimee","Allard","Birgitta","Demi","Jorick","Justin","Marvin","Rainer","Sybren","Tjardo"];

function getData(){ return getJSON(storageKey,[]) }
function setData(v){ setJSON(storageKey,v) }

const listBody=document.querySelector('#listTable tbody');
const fClubSupp=document.getElementById('fClubSupp');

function render(){
  const rows = getData().filter(r => !fClubSupp.value || r.clubondersteuner===fClubSupp.value);
  listBody.innerHTML='';
  rows.forEach(r=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(r.vereniging||'')}</td>
                    <td>${escapeHtml(r.typeTraject||'')}</td>
                    <td>${escapeHtml(r.stage||'')}</td>
                    <td>${escapeHtml(r.clubondersteuner||'')}</td>`;
    listBody.appendChild(tr);
  });
}

function openModal(id=null){
  const modal=document.getElementById('cardModal'); const form=document.getElementById('cardForm'); modal.classList.add('show');
  const rows=getData();
  let data={ id:uid(), vereniging:'', typeTraject:'', clubondersteuner:'', trajectbegeleider:'', startDate:'', endDateExpected:'', costBudget:'', financingType:'', financingPct:'', financingAmount:'', ownPct:'', ownAmount:'', stage:'intake', notes:'', lastUpdate:new Date().toISOString().slice(0,10) };
  if(id){ const i=rows.findIndex(x=>x.id===id); if(i>=0) data=rows[i]; }
  for(const [k,v] of Object.entries(data)){ const el=form.querySelector(`[name="${k}"]`); if(el) el.value=v??''; }
  document.getElementById('cancelModalBtn').onclick=()=> modal.classList.remove('show');
  form.onsubmit=(e)=>{
    e.preventDefault();
    const fd=new FormData(form); const obj=Object.fromEntries(fd.entries());
    const list=getData(); const i=list.findIndex(x=>x.id===obj.id);
    if(i>=0) list[i]=obj; else list.push(obj);
    setData(list); modal.classList.remove('show'); render();
  };
}

document.getElementById('addCardBtn').addEventListener('click',()=>openModal(null));
document.getElementById('exportCsvBtn').addEventListener('click',()=>{
  const rows = getData().filter(r => !fClubSupp.value || r.clubondersteuner===fClubSupp.value);
  const headers=['vereniging','typeTraject','stage','clubondersteuner'];
  const csv=[headers.join(',')].concat(rows.map(r=>headers.map(h=>`"${String(r[h]??'').replaceAll('"','""')}"`).join(','))).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`funnel-v7-export.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

fClubSupp.addEventListener('change', render);
render();
