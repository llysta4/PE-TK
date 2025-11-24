// Mapping kolom ke emoji
const emojiMap = {
  1: "💖",
  2: "🌸",
  3: "🦋",
  4: "⭐",
  5: "🍀",
  6: "🌻",
  7: "🐾",
  8: "💫"
};

// Klik kolom → isi jadi emoji
document.querySelectorAll("td").forEach((cell) => {
  cell.addEventListener("click", () => {
    if (cell.classList.contains("ket")) return;
    if (cell.parentElement.parentElement.tagName === "THEAD") return;

    const colIndex = cell.cellIndex;

    // hanya kolom nilai (1–8)
    if (emojiMap[colIndex]) {
      const row = cell.parentElement;
      row.querySelectorAll("td").forEach((c) => {
        if (!c.classList.contains("ket")) c.textContent = "";
      });
      cell.textContent = emojiMap[colIndex];
    }
  });
});

// Tombol print
document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});