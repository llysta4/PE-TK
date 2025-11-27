/* CONFIG */
const SLOT_GENDERS = ["c","p","p","c","c"]; // 1..5
const MAPEL = [
  "Kerohanian",
  "Moral & Perilaku",
  "Bahasa",
  "Kognitif (Berpikir)",
  "Motorik Halus",
  "Motorik Kasar",
  "Sosial & Emosional",
  "Seni & Kreativitas"
];
const EMOJI = ["💖","🌸","🦋","⭐","🍀","🌻","🐾","💫"];

/* persistent storage per slot: localStorage key 'rapot_slotX' */
function getSaved(slot){
  try { return JSON.parse(localStorage.getItem("rapot_slot"+slot)) || null; }
  catch(e){ return null; }
}
function setSaved(slot, data){
  localStorage.setItem("rapot_slot"+slot, JSON.stringify(data));
}

/* render data list (5 slots) */
function renderDataList(){
  const tbody = document.getElementById("dataTableBody");
  tbody.innerHTML = "";
  for(let i=1;i<=5;i++){
    const saved = getSaved(i);
    const name = saved && saved.nama ? escapeHtml(saved.nama) : `Siswa ${i}`;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${name}</td>
      <td>
        <button class="action-btn btn-edit" onclick="editStudent(${i})">Edit</button>
        <button class="action-btn btn-print" onclick="printRapot(${i})">Print</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}
renderDataList();

/* page switch */
function showPage(id, btn){
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  document.getElementById(id).style.display="block";
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  if(btn) btn.classList.add("active");
}

/* build form for a slot */
function editStudent(slot){
  showPage("inputPage", document.querySelectorAll(".nav-btn")[1]);
  const gender = SLOT_GENDERS[slot-1];
  const themeClass = gender==="p" ? "pink" : "blue";

  const saved = getSaved(slot) || {};

  const container = document.getElementById("formContainer");
  let html = `<div class="card ${themeClass}" id="rapotCard">
    <div class="rapot-head">
      <div><h3>RAPOT — Slot ${slot}</h3>
        <div style="color:var(--muted);font-size:13px">Slot ${slot} • ${gender==="p"?"Perempuan":"Laki-laki"}</div>
      </div>
    </div>

    <div class="identity">
      <label>Nama:<input id="inp_nama" value="${escapeHtmlAttr(saved.nama||'')}" /></label>
      <label>Kelas:<input id="inp_kelas" value="${escapeHtmlAttr(saved.kelas||'')}" /></label>
      <label>NIS:<input id="inp_nis" value="${escapeHtmlAttr(saved.nis||'')}" /></label>
      <label>NISN:<input id="inp_nisn" value="${escapeHtmlAttr(saved.nisn||'')}" /></label>
    </div>

    <table class="rapot-table" id="rapotTable">
      <thead><tr>
        <th>Mata Pelajaran</th>
        <th>A</th><th>A-</th><th>B+</th><th>B</th><th>B-</th><th>C+</th><th>C</th><th>C-</th>
        <th>Keterangan</th>
      </tr></thead>
      <tbody>`;

  MAPEL.forEach((m, idx)=>{
    const rowSaved = saved.rapot && saved.rapot[idx] ? saved.rapot[idx] : null;
    html += `<tr>
      <td>${escapeHtml(m)}</td>
      ${EMOJI.map((e,i)=>`<td class="grade" data-col="${i}">${ rowSaved && rowSaved.grades && rowSaved.grades[i] ? escapeHtml(rowSaved.grades[i]) : "" }</td>`).join("")}
      <td class="ket"><textarea class="ket-text">${ rowSaved ? escapeHtml(rowSaved.ket||'') : '' }</textarea></td>
    </tr>`;
  });

  html += `</tbody></table>

    <div class="rapot-actions">
      <button class="saveBtn" onclick="saveRapot(${slot})">SIMPAN</button>
      <button class="printBtn" onclick="printRapot(${slot})">PRINT RAPOT</button>
      <button class="back-btn" onclick="showPage('dataPage', document.querySelectorAll('.nav-btn')[0])">KEMBALI</button>
    </div>
  </div>`;

  container.innerHTML = html;

  attachGradeHandlers();
  attachAutosize();
}

/* grade click handlers: set emoji, clear other grades in row */
function attachGradeHandlers(){
  document.querySelectorAll(".grade").forEach(td=>{
    td.addEventListener("click", ()=> {
      const tr = td.parentElement;
      const idx = Number(td.dataset.col);
      tr.querySelectorAll(".grade").forEach(c => { c.textContent=""; c.classList.remove("active"); });
      td.textContent = EMOJI[idx] || "";
      td.classList.add("active");
    });
  });
}

/* autosize textarea */
function attachAutosize(){
  document.querySelectorAll(".ket-text").forEach(a=>{
    a.style.height = 'auto';
    a.addEventListener("input", ()=> {
      a.style.height = 'auto';
      a.style.height = (a.scrollHeight) + 'px';
    });
    // init height
    a.style.height = (a.scrollHeight) + 'px';
  });
}

/* save rapot slot to localStorage */
function saveRapot(slot){
  const nama = document.getElementById("inp_nama").value.trim();
  if(!nama){ alert("Nama harus diisi."); return; }
  const kelas = document.getElementById("inp_kelas").value.trim();
  const nis = document.getElementById("inp_nis").value.trim();
  const nisn = document.getElementById("inp_nisn").value.trim();

  const rows = Array.from(document.querySelectorAll("#rapotTable tbody tr"));
  const rapot = rows.map(r=>{
    const grades = Array.from(r.querySelectorAll(".grade")).map(g=>g.textContent || "");
    const ket = r.querySelector(".ket textarea").value || "";
    return { mapel: r.children[0].textContent, grades, ket };
  });

  const data = { nama, kelas, nis, nisn, rapot };
  setSaved(slot, data);
  renderDataList();
  alert("Rapot tersimpan untuk slot "+slot+".");
}

/* print rapot A4 rapi (uses saved data) */
function printRapot(slot){
  const data = getSaved(slot);
  if(!data){ alert("Rapot belum disimpan untuk siswa ini."); return; }

  const gender = SLOT_GENDERS[slot-1];
  const color = gender==="p" ? {card:"#fff0f6",accent:"#ffb6d9"} : {card:"#eaf6ff",accent:"#9fd6ff"};

  const w = window.open("","_blank","width=900,height=1000");
  const css = `
    <style>
      @page{ size:A4; margin:18mm; }
      body{ font-family: Arial; -webkit-print-color-adjust:exact; print-color-adjust:exact; margin:0; padding:18px; background:white;}
      .card{ padding:18px; border-radius:8px; background:${color.card}; border-left:12px solid ${color.accent}; }
      h1{ margin:0 0 8px 0; font-size:20px; text-align:center; }
      .meta{ margin-top:8px; display:flex; gap:20px; flex-wrap:wrap; }
      .meta p{ margin:4px 0; font-weight:700; }
      table{ width:100%; border-collapse:collapse; margin-top:14px; }
      th, td{ border:2px solid ${color.accent}; padding:8px; vertical-align:top; }
      th{ background:${color.accent}; font-weight:800; }
      td.ket{ width:360px; }
      .sign{ margin-top:28px; display:flex; justify-content:space-between; gap:40px; }
      .sign .box{ width:40%; text-align:center; }
      .small{ font-size:12px; color:#333; margin-top:6px; }
    </style>
  `;

  let html = `<html><head><title>Rapot ${escapeHtml(data.nama)}</title>${css}</head><body>`;
  html += `<div class="card"><h1>RAPOT - Taman Kanak-kanak</h1>`;
  html += `<div class="meta">
    <p>Nama: ${escapeHtml(data.nama)}</p>
    <p>Kelas: ${escapeHtml(data.kelas)}</p>
    <p>NIS: ${escapeHtml(data.nis)}</p>
    <p>NISN: ${escapeHtml(data.nisn)}</p>
  </div>`;

  html += `<table><thead><tr>
    <th>Mata Pelajaran</th>
    <th>A</th><th>A-</th><th>B+</th><th>B</th><th>B-</th><th>C+</th><th>C</th><th>C-</th>
    <th>Keterangan</th>
  </tr></thead><tbody>`;

  data.rapot.forEach(r=>{
    html += `<tr><td>${escapeHtml(r.mapel)}</td>`;
    r.grades.forEach(g => html += `<td>${escapeHtml(g)}</td>`);
    html += `<td class="ket">${escapeHtml(r.ket)}</td></tr>`;
  });

  html += `</tbody></table>`;

  html += `<div class="sign">
    <div class="box">Guru Kelas<br><div class="small">(tanda tangan & nama)</div></div>
    <div class="box">Orang Tua/Wali<br><div class="small">(tanda tangan & nama)</div></div>
  </div>`;

  html += `</div></body></html>`;

  w.document.write(html);
  w.document.close();
  setTimeout(()=>{ w.print(); w.close(); },300);
}

/* helper escape */
function escapeHtml(s){
  if(!s) return "";
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function escapeHtmlAttr(s){ return escapeHtml(s).replaceAll("'", "&#39;"); }
