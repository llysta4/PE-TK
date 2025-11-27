// CONFIG
const SLOT_GENDERS = ["c","p","p","c","c"]; // 5 slots: 'c' cowo, 'p' cewe
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

// load savedData from localStorage (keperluan persist)
let savedData = JSON.parse(localStorage.getItem("rapot_saved")) || [null, null, null, null, null];

// Render data list (5 slots). If saved, show saved name.
function renderDataList() {
  const tbody = document.getElementById("dataTableBody");
  tbody.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const d = savedData[i-1];
    const nameDisplay = d && d.nama ? escapeHtml(d.nama) : `Siswa ${i}`;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nameDisplay}</td>
      <td>
        <button class="action-btn btn-edit" onclick="editStudent(${i})">Edit</button>
        <button class="action-btn btn-print" onclick="printRapot(${i})">Print</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}
renderDataList();

// Page switch (accepts event to set active button)
function showPage(id, evt) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(id).style.display = "block";

  // nav button active class
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  if (evt && evt.target) evt.target.classList.add("active");
  // if switched to dataPage reset navbar to neutral look
  if (id === "dataPage") {
    document.querySelector(".navbar").className = "navbar";
  }
}

// Build input form for selected slot
function editStudent(slotIndex) {
  showPage("inputPage");
  // set navbar color by gender
  const g = SLOT_GENDERS[slotIndex-1];
  const navbar = document.querySelector(".navbar");
  navbar.className = "navbar " + (g === "p" ? "pink" : "blue");

  const container = document.getElementById("formContainer");
  let html = `
    <div class="card ${g === "p" ? "pink" : "blue"}" id="rapotCard">
      <div class="rapot-head">
        <div>
          <h3>Rapot — Slot ${slotIndex}</h3>
          <div style="color:var(--muted);font-size:13px">Slot: ${slotIndex} • Gender: ${g === "p" ? "Perempuan" : "Laki-laki"}</div>
        </div>
      </div>

      <div class="identity" style="margin-top:10px;">
        <label>Nama:<input id="inp_nama" /></label>
        <label>Kelas:<input id="inp_kelas" /></label>
        <label>NIS:<input id="inp_nis" /></label>
        <label>NISN:<input id="inp_nisn" /></label>
      </div>

      <table class="rapot-table" id="rapotTable">
        <thead>
          <tr>
            <th>Mata Pelajaran</th>
            <th>A</th><th>A-</th><th>B+</th><th>B</th><th>B-</th><th>C+</th><th>C</th><th>C-</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
  `;
  MAPEL.forEach(m => {
    html += `<tr>
      <td>${escapeHtml(m)}</td>
      ${EMOJI.map(e => `<td class="grade" data-emoji="${e}"></td>`).join("")}
      <td class="ket" contenteditable="true"></td>
    </tr>`;
  });
  html += `</tbody></table>

      <div class="rapot-actions">
        <button class="saveBtn" onclick="saveRapot(${slotIndex})">SIMPAN</button>
        <button class="print-rapot" onclick="printRapot(${slotIndex})">🖨️ Print Rapot</button>
        <button class="back-btn" onclick="showPage('dataPage', event)">⬅ Kembali</button>
      </div>
    </div>
  `;
  container.innerHTML = html;

  attachValueHandlers();
  // if there's saved data for slot, load it
  if (savedData[slotIndex-1]) loadRapot(slotIndex);
  // focus name
  setTimeout(()=>document.getElementById("inp_nama").focus(),50);
}

// Attach click behaviour for grade cells (Opsi A)
function attachValueHandlers(){
  const gradeCells = document.querySelectorAll(".grade");
  gradeCells.forEach(cell => {
    cell.addEventListener("click", () => {
      const tr = cell.parentElement;
      tr.querySelectorAll(".grade").forEach(c => { c.textContent = ""; c.classList.remove("active"); });
      const e = cell.dataset.emoji || "";
      cell.textContent = e;
      cell.classList.add("active");
    });
  });

  // Make existing contenteditable keterangan auto-expand visually (limited)
  document.querySelectorAll(".ket").forEach(k => {
    k.style.minHeight = "72px";
    k.addEventListener("input", () => {
      // nothing fancy: let it wrap; we ensure min-height is big
      // (could implement autosize by measuring scrollHeight inside a hidden clone if needed)
    });
  });
}

// Save rapot for slot
function saveRapot(slot) {
  const nama = document.getElementById("inp_nama").value.trim();
  const kelas = document.getElementById("inp_kelas").value.trim();
  const nis = document.getElementById("inp_nis").value.trim();
  const nisn = document.getElementById("inp_nisn").value.trim();

  if (!nama) {
    alert("Nama harus diisi dulu.");
    return;
  }

  const rows = Array.from(document.querySelectorAll("#rapotTable tbody tr"));
  const rapot = rows.map(r => {
    const grades = Array.from(r.querySelectorAll(".grade")).map(g => g.textContent || "");
    const ket = r.querySelector(".ket").textContent || "";
    return { mapel: r.children[0].textContent, grades, ket };
  });

  savedData[slot-1] = { nama, kelas, nis, nisn, rapot };
  localStorage.setItem("rapot_saved", JSON.stringify(savedData));
  renderDataList();
  alert("Data rapot berhasil disimpan.");
}

// Load saved rapot into form
function loadRapot(slot){
  const data = savedData[slot-1];
  if(!data) return;
  document.getElementById("inp_nama").value = data.nama || "";
  document.getElementById("inp_kelas").value = data.kelas || "";
  document.getElementById("inp_nis").value = data.nis || "";
  document.getElementById("inp_nisn").value = data.nisn || "";

  const rows = Array.from(document.querySelectorAll("#rapotTable tbody tr"));
  rows.forEach((row, i) => {
    const grades = data.rapot[i].grades || [];
    row.querySelectorAll(".grade").forEach((g, idx) => {
      g.textContent = grades[idx] || "";
      if (g.textContent) g.classList.add("active"); else g.classList.remove("active");
    });
    row.querySelector(".ket").textContent = data.rapot[i].ket || "";
  });
}

// Print rapot for a slot (must be saved)
function printRapot(slot){
  const data = savedData[slot-1];
  if(!data) {
    alert("Rapot belum diisi / disimpan untuk siswa ini.");
    return;
  }

  const w = window.open("", "_blank", "width=900,height=800");
  const css = `
    <style>
      body{ font-family: Arial; padding:20px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .card{ padding:16px; border-left:10px solid #9fd6ff; background:#eaf6ff; border-radius:8px; }
      h2{ margin:0 0 8px 0; }
      table{ width:100%; border-collapse:collapse; margin-top:12px; }
      th, td { border:2px solid #7bb3ff; padding:8px; vertical-align:top; }
      th{ background:#b7dbff; text-align:left; }
      td.ket{ width:360px; text-align:left; white-space:normal; }
      .ident{ margin-top:8px; }
    </style>
  `;

  let html = `
    <html><head><title>Rapot ${escapeHtml(data.nama)}</title>${css}</head><body>
    <div class="card">
      <h2>Rapot Siswa</h2>
      <div class="ident">
        <p><strong>Nama:</strong> ${escapeHtml(data.nama)}</p>
        <p><strong>Kelas:</strong> ${escapeHtml(data.kelas)}</p>
        <p><strong>NIS:</strong> ${escapeHtml(data.nis)}</p>
        <p><strong>NISN:</strong> ${escapeHtml(data.nisn)}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Mata Pelajaran</th>
            <th>A</th><th>A-</th><th>B+</th><th>B</th><th>B-</th><th>C+</th><th>C</th><th>C-</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
  `;
  data.rapot.forEach(r => {
    html += `<tr><td>${escapeHtml(r.mapel)}</td>`;
    r.grades.forEach(g => html += `<td>${escapeHtml(g)}</td>`);
    html += `<td class="ket">${escapeHtml(r.ket)}</td></tr>`;
  });
  html += `</tbody></table></div></body></html>`;

  w.document.write(html);
  w.document.close();
  setTimeout(()=>{ w.print(); w.close(); }, 300);
}

// small helper to escape html
function escapeHtml(s){
  if(!s) return "";
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

// initialize: render data list + keep savedData
renderDataList();
