const CATEGORY_LABELS = {
  Whisky: "ウイスキー",
  Gin: "ジン",
  Vodka: "ウォッカ",
  Rum: "ラム",
  Liqueur: "リキュール"
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderCards(items, container) {
  container.innerHTML = items.map(item => {
    const catLabel = CATEGORY_LABELS[item.category] ?? item.category;
    return `
      <article class="card">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" loading="lazy" />` : ""}
        <div class="pad">
          <h2>${item.name}</h2>
          <div class="meta">${catLabel}</div>
          ${item.note ? `<div class="meta" style="margin-top:6px;">${item.note}</div>` : ""}
          <div class="tags">
            ${(item.taste || []).map(t => `<span class="tag">${t}</span>`).join("")}
          </div>
        </div>
      </article>
    `;
  }).join("");
}

async function main() {
  const res = await fetch("data/cocktails.json", { cache: "no-store" });
  const data = await res.json();

  const grid = document.getElementById("grid");
  const shuffleBtn = document.getElementById("shuffle");

  function showRecommend() {
    const picks = shuffle(data).slice(0, 3);
    renderCards(picks, grid);
  }

  showRecommend();

  shuffleBtn.addEventListener("click", showRecommend);
}

main();
