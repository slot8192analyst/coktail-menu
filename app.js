const state = {
  data: [],
  q: "",
  category: "",
  activeTags: new Set(),
  allTags: [],
  allCategories: []
};

const els = {
  q: document.getElementById("q"),
  category: document.getElementById("category"),
  clear: document.getElementById("clear"),
  tagChips: document.getElementById("tagChips"),
  grid: document.getElementById("grid"),
  count: document.getElementById("count"),
};

const CATEGORY_LABELS = {
  Whisky: "ウイスキー",
  Gin: "ジン",
  Vodka: "ウォッカ",
  Rum: "ラム",
  Liqueur: "リキュール"
};

function normalize(s) {
  return (s ?? "").toString().trim().toLowerCase();
}

function searchableText(item) {
  // ここが「味の雰囲気検索」の中心（tagsを入れている）
  return normalize([
    item.name,
    item.category,
    (item.ingredients || []).join(" "),
    (item.tags || []).join(" "),
    item.note
  ].join(" "));
}

function matches(item) {
  const q = normalize(state.q);
  if (state.category && item.category !== state.category) return false;

  // タグは「選択したタグを全て含む」(AND)
  // ORにしたい場合はここを変えます
  for (const t of state.activeTags) {
    if (!(item.tags || []).includes(t)) return false;
  }

  if (!q) return true;
  return searchableText(item).includes(q);
}

function render() {
  const filtered = state.data.filter(matches);
  els.count.textContent = `${filtered.length} 件`;

  els.grid.innerHTML = filtered.map(item => {
    const catLabel = CATEGORY_LABELS[item.category] ?? item.category;

    return `
      <article class="card">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" loading="lazy" />` : ""}
        <div class="pad">
          <h2>${item.name}</h2>
          <div class="meta">${catLabel} / ${(item.ingredients || []).join("・")}</div>
          ${item.note ? `<div class="meta" style="margin-top:6px;">${item.note}</div>` : ""}
          <div class="tags">
            ${(item.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderTags() {
  els.tagChips.innerHTML = state.allTags.map(t => {
    const active = state.activeTags.has(t) ? "active" : "";
    return `<button class="chip ${active}" data-tag="${t}">${t}</button>`;
  }).join("");

  els.tagChips.querySelectorAll("button[data-tag]").forEach(btn => {
    btn.addEventListener("click", () => {
      const t = btn.dataset.tag;
      if (state.activeTags.has(t)) state.activeTags.delete(t);
      else state.activeTags.add(t);
      renderTags();
      render();
    });
  });
}

function renderCategories() {
  // 既存<option>（全カテゴリ）以外を追加
  state.allCategories.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = CATEGORY_LABELS[c]??c;
    els.category.appendChild(opt);
  });
}

async function main() {
  const res = await fetch("data/cocktails.json", { cache: "no-store" });
  state.data = await res.json();

  state.allCategories = [...new Set(state.data.map(x => x.category).filter(Boolean))].sort();
  state.allTags = [...new Set(state.data.flatMap(x => x.tags || []))].sort();

  renderCategories();
  renderTags();
  render();

  els.q.addEventListener("input", (e) => { state.q = e.target.value; render(); });
  els.category.addEventListener("change", (e) => { state.category = e.target.value; render(); });

  els.clear.addEventListener("click", () => {
    state.q = "";
    state.category = "";
    state.activeTags.clear();
    els.q.value = "";
    els.category.value = "";
    renderTags();
    render();
  });
}

main();
