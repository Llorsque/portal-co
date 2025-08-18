const DEMO_USERS=[{username:"admin",password:"admin123",role:"admin"},{username:"demo",password:"demo123",role:"user"}];
export function setSession(u){sessionStorage.setItem("club_portal_session",JSON.stringify(u));}
export function getSession(){try{return JSON.parse(sessionStorage.getItem("club_portal_session"))}catch{return null}}
export function clearSession(){sessionStorage.removeItem("club_portal_session")}
export function requireAuth(){const s=getSession(); if(!s) window.location.href="index.html"; return s;}
export function attachLogout(sel=".logout"){document.querySelectorAll(sel).forEach(b=>b.addEventListener("click",()=>{clearSession();window.location.href="index.html"}))}
export function uid(){return (crypto?.randomUUID)?crypto.randomUUID():"id-"+Math.random().toString(36).slice(2)+Date.now()}
export function getJSON(k,f=[]){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}
export function setJSON(k,v){localStorage.setItem(k,JSON.stringify(v))}
export function escapeHtml(s){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}
export function daysSince(iso){if(!iso)return 1/0; const t=new Date(iso).getTime(); return Math.floor((Date.now()-t)/(1000*60*60*24))}
