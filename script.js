/* CONFIG: grades, scores, emoji (SET A) */
const GRADE_OPTIONS = ["A","A-","B+","B","B-","C+","C","C-"];
const GRADE_SCORE = { "A":8,"A-":7,"B+":6,"B":5,"B-":4,"C+":3,"C":2,"C-":1 };
const GRADE_EMOJI = { "A":"😄","A-":"🙂","B+":"😐","B":"😌","B-":"😕","C+":"😟","C":"😢","C-":"😭" };

/* DEFAULT categories + 5 submateri each (editable in table) */
const CATEGORIES = {
  "Rohani":[
    "Doa",
    "Pujian",
    "Hafalan ayat",
    "Sikap ibadah",
    "Kerajinan"
  ],
  "Motorik":[
    "Motorik halus",
    "Motorik kasar",
    "Koordinasi tangan & mata",
    "Ketelitian",
    "Kerapian"
  ],
  "Bahasa":[
    "Menyebut kata jelas",
    "Mengenal huruf",
    "Menceritakan kembali",
    "Menjawab pertanyaan",
    "Kosa kata"
  ],
  "Kreativitas":[
    "Menggambar",
    "Mewarnai rapi",
    "Bernyanyi",
    "Menari sederhana",
    "Imajinasi bermain"
  ],
  "Sosial":[
    "Berbagi",
    "Kerja sama",
    "Mengantre",
    "Menghormati guru",
    "Mengelola emosi"
  ],
  "Karakter":[
    "Tanggung jawab",
    "Kemandirian",
    "Kesabaran",
    "Disiplin",
    "Sopan santun"
  ]
};

/* STATE */
let students = JSON.parse(localStorage.getItem("rapot_students") || "[]");
let editIndex = null;

/* DOM */
const pages = { data: document.getElementById("dataPage"), input: document.getElementById("inputPage") };
const studentsList = document.getElementById("studentsList");
const rapotBody = document.getElementById("rapotBody");
const akumulasiInput = document.getElementById("akumulasiInput");
const akumulasiEmoji = document.getElementById("akumulasiEmoji");

/* NAV (navbar unchanged) */
document.querySelectorAll(".nav-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const target = btn.dataset.target;
    if(target === "dataPage") showData();
    if(target === "inputPage") showInput();
  });
});

/* buttons */
document.getElementById("btnNew").addEventListener("click", newForm);
document.getElementById("saveBtn").addEventListener("click", saveStudent);
document.getElementById("backBtn").addEventListener("click", showData);
document.getElementById("printBtn").addEventListener("click", printCurrent);

/* INITIAL */
buildRapotTable();
calculateAkumulasi();
renderStudentList();

/* Build table rows from CATEGORIES */
function buildRapotTable(){
  rapotBody.innerHTML = "";
  Object.keys(CATEGORIES).forEach(cat=>{
    const subs = CATEGORIES[cat];
    subs.forEach((sub, i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="category-cell" contenteditable="true">${i===0 ? cat : ""}</td>
        <td class="sub-cell" contenteditable="true">${sub}</td>

        <td><select class="pe-select pe1">${gradeOptions()}</select></td>
        <td class="em-cell em1"></td>

        <td><select class="pe-select pe2">${gradeOptions()}</select></td>
        <td class="em-cell em2"></td>

        <td><select class="pe-select pe3">${gradeOptions()}</select></td>
        <td class="em-cell em3"></td>
      `;
      rapotBody.appendChild(tr);
    });
  });

  // listeners for selects
  rapotBody.querySelectorAll("select.pe-select").forEach(sel=>{
    sel.addEventListener("change", onGradeChange);
  });

  // allow edit category/submateri (contenteditable) - no extra listeners needed
}

/* helper: options html */
function gradeOptions(){
  return GRADE_OPTIONS.map(g=>`<option value="${g}">${g}</option>`).join("");
}

/* when grade changed */
function onGradeChange(e){
  const row = e.target.closest("tr");
  const pe1 = row.querySelector(".pe1").value;
  const pe2 = row.querySelector(".pe2").value;
  const pe3 = row.querySelector(".pe3").value;
  row.querySelector(".em1").textContent = GRADE_EMOJI[pe1] || "";
  row.querySelector(".em2").textContent = GRADE_EMOJI[pe2] || "";
  row.querySelector(".em3").textContent = GRADE_EMOJI[pe3] || "";
  calculateAkumulasi();
}

/* calculate akumulasi (average numeric -> nearest grade) */
function calculateAkumulasi(){
  const rows = Array.from(document.querySelectorAll("#rapotBody tr"));
  let total = 0, count = 0;
  rows.forEach(r=>{
    ["pe1","pe2","pe3"].forEach(cls=>{
      const sel = r.querySelector(`select.${cls}`);
      if(sel && sel.value){
        const sc = GRADE_SCORE[sel.value] || 0;
        total += sc; count++;
      }
    });
  });
  if(count === 0){
    akumulasiInput.value = "";
    akumulasiEmoji.textContent = "";
    return;
  }
  const avg = total / count;
  let nearest = "C-", bestDiff = Infinity;
  for(const [g,score] of Object.entries(GRADE_SCORE)){
    const d = Math.abs(score - avg);
    if(d < bestDiff){ bestDiff = d; nearest = g; }
  }
  akumulasiInput.value = `${nearest} (avg ${avg.toFixed(2)})`;
  akumulasiEmoji.textContent = GRADE_EMOJI[nearest] || "";
}

/* Save student entry */
function saveStudent(){
  const ident = {
    nama: document.getElementById("inp_nama").value.trim(),
    kelas: document.getElementById("inp_kelas").value.trim(),
    nis: document.getElementById("inp_nis").value.trim(),
    nisn: document.getElementById("inp_nisn").value.trim(),
    alamat: document.getElementById("inp_alamat").value.trim(),
    semester: document.getElementById("inp_semester").value.trim(),
    sekolah: document.getElementById("inp_sekolah").value.trim(),
    fase: document.getElementById("inp_fase").value.trim()
  };
  if(!ident.nama){ alert("Nama harus diisi"); return; }

  const rows = Array.from(document.querySelectorAll("#rapotBody tr"));
  const nilai = rows.map(r=>{
    const kategori = findCategoryForRow(r);
    return {
      kategori,
      submateri: r.querySelector(".sub-cell").textContent.trim(),
      pe1: r.querySelector(".pe1").value,
      em1: r.querySelector(".em1").textContent,
      pe2: r.querySelector(".pe2").value,
      em2: r.querySelector(".em2").textContent,
      pe3: r.querySelector(".pe3").value,
      em3: r.querySelector(".em3").textContent
    };
  });

  const entry = { ident, nilai, akumulasi: akumulasiInput.value || "" };

  if(editIndex === null){ students.push(entry); } else { students[editIndex] = entry; }

  localStorage.setItem("rapot_students", JSON.stringify(students));
  alert("Tersimpan.");
  editIndex = null;
  showData();
  renderStudentList();
}

/* helper to find category for row (search upward) */
function findCategoryForRow(row){
  let tr = row;
  while(tr){
    const cat = tr.querySelector(".category-cell").textContent.trim();
    if(cat) return cat;
    tr = tr.previousElementSibling;
  }
  return "";
}

/* render student list */
function renderStudentList(){
  studentsList.innerHTML = "";
  students.forEach((s, idx)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(s.ident.nama)}</td>
      <td>
        <button onclick="editStudent(${idx})">Edit</button>
        <button onclick="printStudent(${idx})">Print</button>
        <button onclick="deleteStudent(${idx})">Hapus</button>
      </td>`;
    studentsList.appendChild(tr);
  });
}

/* edit */
function editStudent(i){
  const s = students[i];
  if(!s) return;
  editIndex = i;
  // fill ident
  document.getElementById("inp_nama").value = s.ident.nama || "";
  document.getElementById("inp_kelas").value = s.ident.kelas || "";
  document.getElementById("inp_nis").value = s.ident.nis || "";
  document.getElementById("inp_nisn").value = s.ident.nisn || "";
  document.getElementById("inp_alamat").value = s.ident.alamat || "";
  document.getElementById("inp_semester").value = s.ident.semester || "";
  document.getElementById("inp_sekolah").value = s.ident.sekolah || "";
  document.getElementById("inp_fase").value = s.ident.fase || "";

  buildRapotTable();
  // fill values into rows
  const rows = Array.from(document.querySelectorAll("#rapotBody tr"));
  rows.forEach((r, idx)=>{
    const d = s.nilai[idx] || {};
    if(d.pe1) r.querySelector(".pe1").value = d.pe1;
    if(d.pe2) r.querySelector(".pe2").value = d.pe2;
    if(d.pe3) r.querySelector(".pe3").value = d.pe3;
    r.querySelector(".em1").textContent = d.em1 || "";
    r.querySelector(".em2").textContent = d.em2 || "";
    r.querySelector(".em3").textContent = d.em3 || "";
    // restore category/submateri if present
    if(d.kategori){
      const catCell = r.querySelector(".category-cell");
      if(!catCell.textContent.trim()) catCell.textContent = d.kategori;
    }
    if(d.submateri) r.querySelector(".sub-cell").textContent = d.submateri;
  });
  calculateAkumulasi();
  showInput();
}

/* delete student */
function deleteStudent(i){
  if(!confirm("Hapus data?")) return;
  students.splice(i,1);
  localStorage.setItem("rapot_students", JSON.stringify(students));
  renderStudentList();
}

/* print student by index */
function printStudent(i){
  const s = students[i];
  if(!s) return alert("Tidak ditemukan");
  const w = window.open("","_blank","width=900,height=1000");
  const css = `<style>body{font-family:Arial;padding:18px}table{width:100%;border-collapse:collapse}th,td{border:2px solid #9fc8ff;padding:8px}th{background:#cfe7ff} .ident td{border:none;padding:4px;text-align:left}</style>`;
  let html = `<html><head><title>Rapot ${escapeHtml(s.ident.nama)}</title>${css}</head><body>`;
  html += `<h2 style="text-align:center">RAPOT - TK</h2>`;
  html += `<table class="ident"><tr><td>Nama</td><td>: ${escapeHtml(s.ident.nama)}</td></tr>
           <tr><td>Kelas</td><td>: ${escapeHtml(s.ident.kelas)}</td></tr>
           <tr><td>NIS</td><td>: ${escapeHtml(s.ident.nis)}</td></tr>
           <tr><td>NISN</td><td>: ${escapeHtml(s.ident.nisn)}</td></tr>
           <tr><td>Alamat</td><td>: ${escapeHtml(s.ident.alamat)}</td></tr>
           <tr><td>Semester</td><td>: ${escapeHtml(s.ident.semester)}</td></tr>
           <tr><td>Sekolah</td><td>: ${escapeHtml(s.ident.sekolah)}</td></tr>
           <tr><td>Fase</td><td>: ${escapeHtml(s.ident.fase)}</td></tr></table>`;
  html += `<table><thead><tr><th>Kategori</th><th>Submateri</th><th>PE1</th><th>Em</th><th>PE2</th><th>Em</th><th>PE3</th><th>Em</th></tr></thead><tbody>`;
  s.nilai.forEach(r=>{
    html += `<tr>
      <td>${escapeHtml(r.kategori)}</td>
      <td style="text-align:left">${escapeHtml(r.submateri)}</td>
      <td>${escapeHtml(r.pe1)}</td><td>${escapeHtml(r.em1)}</td>
      <td>${escapeHtml(r.pe2)}</td><td>${escapeHtml(r.em2)}</td>
      <td>${escapeHtml(r.pe3)}</td><td>${escapeHtml(r.em3)}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  html += `<div style="display:flex;justify-content:space-between;margin-top:30px"><div style="width:45%;text-align:center">Wali Kelas<br><br>_______________</div><div style="width:45%;text-align:center">Orang Tua<br><br>_______________</div></div>`;
  html += `</body></html>`;
  w.document.write(html); w.document.close();
  setTimeout(()=>{ w.print(); w.close(); },300);
}

/* print current form */
function printCurrent(){
  printCurrentForm();
}
function printCurrentForm(){
  const ident = {
    nama: document.getElementById("inp_nama").value.trim(),
    kelas: document.getElementById("inp_kelas").value.trim(),
    nis: document.getElementById("inp_nis").value.trim(),
    nisn: document.getElementById("inp_nisn").value.trim(),
    alamat: document.getElementById("inp_alamat").value.trim(),
    semester: document.getElementById("inp_semester").value.trim(),
    sekolah: document.getElementById("inp_sekolah").value.trim(),
    fase: document.getElementById("inp_fase").value.trim()
  };
  const rows = Array.from(document.querySelectorAll("#rapotBody tr"));
  const tableRows = rows.map(r=>{
    const kategori = findCategoryForRow(r);
    const sub = r.querySelector(".sub-cell").textContent;
    const pe1 = r.querySelector(".pe1").value; const em1 = r.querySelector(".em1").textContent;
    const pe2 = r.querySelector(".pe2").value; const em2 = r.querySelector(".em2").textContent;
    const pe3 = r.querySelector(".pe3").value; const em3 = r.querySelector(".em3").textContent;
    return `<tr><td>${escapeHtml(kategori)}</td><td style="text-align:left">${escapeHtml(sub)}</td>
      <td>${escapeHtml(pe1)}</td><td>${escapeHtml(em1)}</td><td>${escapeHtml(pe2)}</td><td>${escapeHtml(em2)}</td>
      <td>${escapeHtml(pe3)}</td><td>${escapeHtml(em3)}</td></tr>`;
  }).join("");
  const w = window.open("","_blank","width=900,height=1000");
  const css = `<style>body{font-family:Arial;padding:18px}table{width:100%;border-collapse:collapse}th,td{border:2px solid #9fc8ff;padding:8px}th{background:#cfe7ff}</style>`;
  let html = `<html><head><title>Print Rapot</title>${css}</head><body>`;
  html += `<h2 style="text-align:center">RAPOT - TK</h2>`;
  html += `<table><tr><td>Nama</td><td>${escapeHtml(ident.nama)}</td></tr><tr><td>Kelas</td><td>${escapeHtml(ident.kelas)}</td></tr></table>`;
  html += `<table><thead><tr><th>Kategori</th><th>Submateri</th><th>PE1</th><th>Em</th><th>PE2</th><th>Em</th><th>PE3</th><th>Em</th></tr></thead><tbody>${tableRows}</tbody></table>`;
  html += `<div style="display:flex;justify-content:space-between;margin-top:30px"><div style="width:45%;text-align:center">Wali Kelas<br><br>_______________</div><div style="width:45%;text-align:center">Orang Tua<br><br>_______________</div></div>`;
  html += `</body></html>`;
  w.document.write(html); w.document.close();
  setTimeout(()=>{ w.print(); w.close(); },300);
}

/* helpers */
function escapeHtml(s){ if(!s) return ""; return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }

/* new form */
function newForm(){
  editIndex = null;
  ["inp_nama","inp_kelas","inp_nis","inp_nisn","inp_alamat","inp_semester","inp_sekolah","inp_fase"].forEach(id=>{
    document.getElementById(id).value = "";
  });
  buildRapotTable();
  calculateAkumulasi();
  showInput();
}

/* show data/input */
function showData(){ pages.data.style.display=""; pages.input.style.display="none"; renderStudentList(); }
function showInput(){ pages.data.style.display="none"; pages.input.style.display=""; }

/* initial render */
renderStudentList();
