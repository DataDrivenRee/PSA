document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const slips = document.querySelectorAll(".slip");

    slips.forEach(slip => {
      const text = slip.textContent.toLowerCase();
      slip.style.display = text.includes(term) ? "block" : "none";
    });
  });
});
