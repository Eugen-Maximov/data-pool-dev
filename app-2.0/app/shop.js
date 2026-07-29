(() => {
  const modal = document.getElementById("item-modal");
  if (!modal) return;

  const titleEl = document.getElementById("item-modal-title");
  const categoryEl = document.getElementById("item-modal-category");
  const statsEl = document.getElementById("item-modal-stats");
  const bodyEl = document.getElementById("item-modal-body");

  const STAT_LABELS = {
    skill: "Навык",
    damage: "Урон",
    magazine: "Магазин",
    rof: "ROF",
    hands: "Руки",
    modSlots: "Слоты модов",
    concealable: "Скрыть",
    features: "Особенности",
    example: "Примеры",
    price: "Цена",
    availability: "Доступность",
    priceNote: "Примечание к цене",
    source: "Источник",
    sp: "ОС",
    bodyPart: "Часть тела",
    penalty: "Штрафы",
    style: "Стиль",
    brand: "Бренд",
    humanity: "ПЧ",
    install: "Установка",
    type: "Тип",
    stats: "Характеристики",
    exoskeleton: "Экзоскелет",
    shell: "Оболочка",
    weapons: "Борт. оружие",
    cyberware: "Борт. импланты",
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderStats(stats) {
    if (!stats) {
      statsEl.innerHTML = "";
      return;
    }
    statsEl.innerHTML = Object.entries(STAT_LABELS)
      .filter(([key]) => stats[key])
      .map(
        ([key, label]) =>
          `<div class="detail-stat"><span>${label}</span><strong>${escapeHtml(
            String(stats[key])
          )}</strong></div>`
      )
      .join("");
  }

  function openItem(btn) {
    const slug = btn.dataset.slug;
    const tpl = document.getElementById(`item-tpl-${slug}`);
    if (!tpl) return;

    const clone = tpl.content.cloneNode(true);
    const statsNode = clone.querySelector(".item-stats");
    let stats = {};
    try {
      stats = JSON.parse(statsNode?.textContent || "{}");
    } catch {
      stats = {};
    }
    statsNode?.remove();

    titleEl.textContent = btn.dataset.title || "";
    categoryEl.textContent = btn.dataset.categoryLabel || "";
    renderStats(stats);
    bodyEl.replaceChildren(clone);

    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  }

  function closeModal() {
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  }

  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest("[data-item-open]");
    if (openBtn) {
      openItem(openBtn);
      return;
    }
    if (e.target.closest("[data-close-modal]")) closeModal();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.open) closeModal();
  });

  function getCatalogRoot(el) {
    return el.closest("[data-catalog]") || el.closest(".content") || document;
  }

  function applyCatalogFilters(root) {
    const catalog = root.matches?.("[data-catalog]")
      ? root
      : root.querySelector?.("[data-catalog]") || root;
    const input = catalog.querySelector("[data-catalog-filter]");
    const countEl = catalog.querySelector("[data-catalog-count]");
    const grid = catalog.querySelector("[data-catalog-grid]");
    if (!grid) return;

    const q = (input?.value || "").trim().toLowerCase();
    const activeTab = catalog.querySelector(".shop-tab.is-active");
    const category = activeTab?.dataset.category || "*";

    let visible = 0;
    grid.querySelectorAll(".weapon-card").forEach((card) => {
      const hay = card.dataset.search || "";
      const cardCats = (card.dataset.category || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const matchCat =
        category === "*" ||
        cardCats.includes(category) ||
        (!cardCats.length && (card.dataset.category || "") === category);
      const matchText = !q || hay.includes(q);
      const show = matchCat && matchText;
      card.hidden = !show;
      if (show) visible++;
    });
    if (countEl) countEl.textContent = String(visible);
  }

  document.querySelectorAll("[data-catalog]").forEach((catalog) => {
    const tabs = catalog.querySelectorAll(".shop-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          t.classList.toggle("is-active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        applyCatalogFilters(catalog);
      });
    });

    const input = catalog.querySelector("[data-catalog-filter]");
    input?.addEventListener("input", () => applyCatalogFilters(catalog));
  });

  // Article tabs (clothes, acpa rules)
  document.querySelectorAll(".tab-buttons").forEach((bar) => {
    const buttons = bar.querySelectorAll(".tab-button");
    const root = bar.parentElement;
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.tab;
        buttons.forEach((b) => b.classList.toggle("active", b === btn));
        root.querySelectorAll(".tab-content").forEach((panel) => {
          panel.classList.toggle("active", panel.id === id);
        });
      });
    });
  });
})();
