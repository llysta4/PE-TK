const container = document.getElementById("formContainer");

const genders = ["male", "female", "female", "male", "male"];

let savedData = [null, null, null, null, null];

function showPage(id, btn) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function editStudent(no) {
  showPage("inputPage", document.querySelectorAll(".nav-btn")[1]);

  const g = genders[no - 1];
  const cardColor = g === "male" ? "card-blue" : "card-pink";

  container.innerHTML = `
    <div class="student-card ${cardColor}">
      <div class="identity">
        <input id="nama" type="text" placeholder="Nama">
        <input id="kelas" type="text" placeholder="Kelas">
        <input id="nis" type="text" placeholder="NIS">
        <input id="nisn" type="text" placeholder="NISN">
      </div>

      <table id="rapotTable">
        <thead>
          <tr>
            <th>Mapel</th>
            <th>A</th>
            <th>A-</th>
            <th>B+</th>
            <th>B</th>
            <th>B-</th>
            <th>C+</th>
            <th>C</th>
            <th>C-</th>
            <th>Keterangan</th>
          </tr>
        </thead>

        <tbody>
          ${makeRow("Matematika")}
          ${makeRow("Bahasa Indonesia")}
          ${makeRow("Bahasa Inggris")}
          ${makeRow("IPA")}
          ${makeRow("IPS")}
          ${makeRow("PPKn")}
        </tbody>
      </table>

      <button class="saveBtn" onclick="saveRapot(${no})">SIMPAN</button>
    </div>
  `;

  activateGrades();

  if (savedData[no - 1]) loadRapot(no);
}

function makeRow(mapel) {
  return `
    <tr>
      <td>${mapel}</td>
      ${makeGradeCells()}
      <td class="ket" contenteditable="true"></td>
    </tr>
  `;
}

function makeGradeCells() {
  return `
    <td class="grade"></td>
    <td class="grade"></td>
    <td class="grade"></td>
    <td class="grade"></td>
    <td class="grade"></td>
    <td class="grade"></td>
    <td class="grade"></td>
    <td class="grade"></td>
  `;
}

function activateGrades() {
  const emojis = ["💖","🌸","🦋","⭐","🍀","🌻","🐾","💫"];

  document.querySelectorAll("td.grade").forEach((cell, i) => {
    cell.addEventListener("click", () => {
      const row = cell.parentElement;

      row.querySelectorAll(".grade").forEach(c => c.textContent = "");
      cell.textContent = emojis[i % emojis.length];
    });
  });
}

function saveRapot(no) {
  const nama = document.getElementById("nama").value;
  const kelas = document.getElementById("kelas").value;
  const nis = document.getElementById("nis").value;
  const nisn = document.getElementById("nisn").value;

  const rows = [...document.querySelectorAll("#rapotTable tbody tr")];
  
  const rapot = rows.map(r => ({
    mapel: r.children[0].textContent,
    grades: [...r.querySelectorAll(".grade")].map(td => td.textContent),
    ket: r.querySelector(".ket").textContent
  }));

  savedData[no - 1] = { nama, kelas, nis, nisn, rapot };

  alert("Rapot berhasil disimpan!");
}

function loadRapot(no) {
  const d = savedData[no - 1];

  document.getElementById("nama").value = d.nama;
  document.getElementById("kelas").value = d.kelas;
  document.getElementById("nis").value = d.nis;
  document.getElementById("nisn").value = d.nisn;

  const rows = [...document.querySelectorAll("#rapotTable tbody tr")];

  rows.forEach((row, i) => {
    const grades = row.querySelectorAll(".grade");
    grades.forEach((g, idx) => g.textContent = d.rapot[i].grades[idx]);
    row.querySelector(".ket").textContent = d.rapot[i].ket;
  });
}

function printRapot(no) {
  if (!savedData[no - 1]) return alert("Rapot belum disimpan!");

  const d = savedData[no - 1];
  const w = window.open("");

  let html = `
  <html>
  <head>
  <style>
    body { font-family: Poppins; padding: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 2px solid #7bb3ff; padding: 8px; }
    th { background: #b7dbff; }
  </style>
  </head>
  <body>
    <h2>Rapot Siswa</h2>
    <p><b>Nama:</b> ${d.nama}</p>
    <p><b>Kelas:</b> ${d.kelas}</p>
    <p><b>NIS:</b> ${d.nis}</p>
    <p><b>NISN:</b> ${d.nisn}</p>

    <table>
      <thead>
        <tr>
          <th>Mapel</th>
          <th>A</th>
          <th>A-</th>
          <th>B+</th>
          <th>B</th>
          <th>B-</th>
          <th>C+</th>
          <th>C</th>
          <th>C-</th>
          <th>Keterangan</th>
        </tr>
      </thead>
      <tbody>
  `;

  d.rapot.forEach(r => {
    html += `<tr><td>${r.mapel}</td>`;
    r.grades.forEach(g => html += `<td>${g}</td>`);
    html += `<td>${r.ket}</td></tr>`;
  });

  html += `
      </tbody>
    </table>
  </body>
  </html>`;

  w.document.write(html);
  w.document.close();
  w.print();
}
