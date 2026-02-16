(() => {
  const list = document.getElementById("blog-list");
  const search = document.getElementById("blog-search");
  const empty = document.getElementById("blog-empty");
  if (!list) return;

  const cards = Array.from(list.querySelectorAll(".item"));

  const parseDate = (value) => {
    const t = Date.parse(value || "");
    return Number.isNaN(t) ? 0 : t;
  };

  const render = () => {
    const q = (search?.value || "").trim().toLowerCase();

    const filtered = cards
      .filter((card) => {
        const haystack = (card.dataset.search || "").toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => parseDate(b.dataset.date) - parseDate(a.dataset.date));

    list.innerHTML = "";
    filtered.forEach((card) => list.appendChild(card));

    if (empty) {
      empty.style.display = filtered.length ? "none" : "block";
    }
  };

  if (search) search.addEventListener("input", render);
  render();
})();
