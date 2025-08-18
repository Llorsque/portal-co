
// --- Eenvoudige demo-config (vervang later) ---
const DEMO_USERS = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "demo", password: "demo123", role: "user" },
];

const storageKey = "club_portal_submissions_v2";

const $ = (sel) => document.querySelector(sel);
const authSection = "#auth";
function el(q){return document.querySelector(q)}
const userArea = el("#userArea");
const adminArea = el("#adminArea");
const loginForm = el("#loginForm");
const submissionForm = el("#submissionForm");
const userFeedback = el("#userFeedback");
const logoutBtn = el("#logoutBtn");
const logoutBtnAdmin = el("#logoutBtnAdmin");
const searchInput = el("#search");
const exportCsvBtn = el("#exportCsvBtn");
const clearAllBtn = el("#clearAllBtn");
const tableBody = document.querySelector("#submissionsTable tbody");
const myTableBody = document.querySelector("#mySubmissionsTable tbody");
const resetFormBtn = el("#resetFormBtn");
const ownerInput = el("#owner");

function setSession(user) {
  sessionStorage.setItem("club_portal_session", JSON.stringify(user));
}
function getSession() {
  try { return JSON.parse(sessionStorage.getItem("club_portal_session")); } catch { return null; }
}
function clearSession() { sessionStorage.removeItem("club_portal_session"); }

function show(view) {
  el("#auth").classList.toggle("hidden", view !== "auth");
  userArea.classList.toggle("hidden", view !== "user");
  adminArea.classList.toggle("hidden", view !== "admin");
}

function getData() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; }
}
function setData(rows) {
  localStorage.setItem(storageKey, JSON.stringify(rows));
}

function serializeForm(form) {
  const fd = new FormData(form);
  const obj = Object.fromEntries(fd.entries());
  obj.consent = fd.get("consent") ? true : false;
  return obj;
}

function notify(elm, msg) {
  elm.textContent = msg; elm.classList.remove("hidden");
  setTimeout(() => elm.classList.add("hidden"), 3000);
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"]/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
  })[c]);
}

function renderTable(filter = "") {
  const rows = getData();
  const q = filter.trim().toLowerCase();
  const filtered = !q
    ? rows
    : rows.filter(r =>
        [r.voornaam, r.achternaam, r.vereniging, r.thema, r.hulpvraag, r.email, r.telefoon, r.status, r.notes, r.owner]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(q))
      );

  tableBody.innerHTML = "";
  filtered.forEach((r, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(r.createdAt).toLocaleString()}</td>
      <td>${escapeHtml(r.voornaam)}</td>
      <td>${escapeHtml(r.achternaam)}</td>
      <td>${escapeHtml(r.vereniging)}</td>
      <td>${escapeHtml(r.thema)}</td>
      <td>${escapeHtml(r.hulpvraag)}</td>
      <td>${escapeHtml(r.email)}</td>
      <td>${escapeHtml(r.telefoon)}</td>
      <td>
        <select data-idx="${idx}" class="status-select">
          ${["Nieuw","In behandeling","Afgerond"].map(s => `<option ${r.status===s?"selected":""}>${s}</option>`).join("")}
        </select>
      </td>
      <td>
        <textarea data-idx="${idx}" class="note-input" rows="2" placeholder="Notities…">${escapeHtml(r.notes || "")}</textarea>
      </td>
      <td>
        <button data-idx="${idx}" class="save-row">Opslaan</button>
        <button data-idx="${idx}" class="danger delete-row">Verwijder</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function renderMySubmissions(owner) {
  const rows = getData().filter(r => r.owner === owner);
  myTableBody.innerHTML = "";
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(r.createdAt).toLocaleString()}</td>
      <td>${escapeHtml(r.vereniging)}</td>
      <td>${escapeHtml(r.thema)}</td>
      <td>${escapeHtml(r.status || "Nieuw")}</td>
      <td>
        <button class="edit-my" data-id="${r.id}">Bewerken</button>
        <button class="danger delete-my" data-id="${r.id}">Verwijder</button>
      </td>
    `;
    myTableBody.appendChild(tr);
  });
}

function findIndexById(id) {
  const rows = getData();
  return rows.findIndex(r => r.id === id);
}

function populateForm(row) {
  for (const [k, v] of Object.entries(row)) {
    const el = submissionForm.querySelector(`[name="${k}"]`);
    if (!el) continue;
    if (el.type === "checkbox") el.checked = !!v;
    else el.value = v;
  }
}

function clearForm() {
  submissionForm.reset();
}

function exportCsv() {
  const rows = getData();
  if (!rows.length) return alert("Geen data om te exporteren.");
  const headers = [
    "id","createdAt","owner","voornaam","achternaam","vereniging","hulpvraag","email","telefoon","thema","status","notes","consent"
  ];
  const csv = [headers.join(",")]
    .concat(rows.map(r => headers.map(h => `"${String(r[h] ?? "").replaceAll('"', '""')}"`).join(",")))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `inzendingen-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function handleAdminTableClick(e) {
  const idx = e.target.dataset.idx;
  if (e.target.classList.contains("delete-row")) {
    const rows = getData();
    if (!confirm("Weet je zeker dat je deze inzending wilt verwijderen?")) return;
    rows.splice(Number(idx), 1); setData(rows); renderTable(searchInput.value);
  } else if (e.target.classList.contains("save-row")) {
    const rows = getData();
    const row = rows[Number(idx)];
    const statusEl = document.querySelector(`select.status-select[data-idx="${idx}"]`);
    const noteEl = document.querySelector(`textarea.note-input[data-idx="${idx}"]`);
    row.status = statusEl.value;
    row.notes = noteEl.value;
    setData(rows);
    alert("Opgeslagen.");
  }
}

function handleMyTableClick(e) {
  const id = e.target.dataset.id;
  if (!id) return;
  const rows = getData();
  const idx = findIndexById(id);
  if (idx < 0) return;

  if (e.target.classList.contains("delete-my")) {
    if (!confirm("Mijn inzending verwijderen?")) return;
    rows.splice(idx, 1); setData(rows);
    renderMySubmissions(getSession()?.username);
  } else if (e.target.classList.contains("edit-my")) {
    const row = rows[idx];
    populateForm(row);
    submissionForm.dataset.editId = id;
    document.getElementById("submitBtn").textContent = "Wijzigingen opslaan";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const session = getSession();
  if (session?.role === "admin") { show("admin"); renderTable(); }
  else if (session?.role === "user") { show("user"); ownerInput.value = session.username; renderMySubmissions(session.username); }
  else show("auth");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const user = DEMO_USERS.find(u => u.username === username && u.password === password);
    if (!user) { alert("Onjuiste inloggegevens (demo)"); return; }
    setSession({ username: user.username, role: user.role });
    if (user.role === "admin") { show("admin"); renderTable(); }
    else { show("user"); ownerInput.value = user.username; renderMySubmissions(user.username); }
  });

  logoutBtn?.addEventListener("click", () => { clearSession(); show("auth"); });
  logoutBtnAdmin?.addEventListener("click", () => { clearSession(); show("auth"); });

  submissionForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = serializeForm(submissionForm);
    const rows = getData();
    const now = new Date().toISOString();

    if (submissionForm.dataset.editId) {
      const id = submissionForm.dataset.editId;
      const idx = findIndexById(id);
      if (idx >= 0) {
        const prev = rows[idx];
        rows[idx] = { ...prev, ...data, updatedAt: now };
        setData(rows);
        notify(userFeedback, "Wijzigingen opgeslagen (demo).");
      }
      submissionForm.dataset.editId = "";
      document.getElementById("submitBtn").textContent = "Opslaan / Verzenden";
      clearForm();
      renderMySubmissions(getSession()?.username);
      return;
    }

    const row = {
      id: crypto.randomUUID(),
      ...data,
      owner: getSession()?.username || "anoniem",
      status: "Nieuw",
      notes: "",
      createdAt: now
    };
    rows.push(row); setData(rows);
    clearForm();
    notify(userFeedback, "Dank! Je inzending is opgeslagen (demo).");
    renderMySubmissions(getSession()?.username);
  });

  resetFormBtn?.addEventListener("click", clearForm);

  searchInput?.addEventListener("input", () => renderTable(searchInput.value));
  exportCsvBtn?.addEventListener("click", exportCsv);
  clearAllBtn?.addEventListener("click", () => {
    if (confirm("Alles wissen? Dit verwijdert alle demo-inzendingen in deze browser.")) {
      setData([]); renderTable("");
    }
  });
  tableBody?.addEventListener("click", handleAdminTableClick);

  myTableBody?.addEventListener("click", handleMyTableClick);
});
