// Conditional progressive polyfills per modern-web-guidance (navbar & tabs)
if (!Object.hasOwn(HTMLElement.prototype, "popover")) {
  import("https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js").catch(() => {});
}
if (!Object.hasOwn(HTMLElement.prototype, "focusGroup")) {
  import("https://esm.sh/@microsoft/focusgroup-polyfill")
    .then(({ polyfill }) => polyfill())
    .catch(() => {});
}

// Responsive navbar wide/collapsed state synchronization
const siteHeader = document.querySelector(".site-header");
const headerInner = document.querySelector(".header-inner");
const menuBtn = document.querySelector(".menu-button");
const siteMenu = document.getElementById("site-menu");
let lastMeasuredWidth = 0;

function updateNavLayout() {
  if (!siteHeader || !headerInner || !siteMenu) return;
  const currentWidth = headerInner.clientWidth;
  if (!siteHeader.classList.contains("is-wide") && currentWidth <= lastMeasuredWidth && lastMeasuredWidth > 0) {
    return;
  }
  lastMeasuredWidth = currentWidth;
  const wasOpen = siteMenu.matches(":popover-open, .\\:popover-open");
  siteHeader.classList.add("is-measuring", "is-wide");
  const fits = headerInner.scrollWidth <= headerInner.clientWidth;
  siteHeader.classList.toggle("is-wide", fits);
  if (fits) {
    siteMenu.removeAttribute("popover");
  } else {
    siteMenu.setAttribute("popover", "auto");
    if (wasOpen && typeof siteMenu.showPopover === "function") {
      try {
        siteMenu.showPopover();
      } catch {}
    }
  }
  requestAnimationFrame(() => siteHeader.classList.remove("is-measuring"));
}

if (typeof ResizeObserver !== "undefined" && headerInner) {
  const ro = new ResizeObserver(() => updateNavLayout());
  ro.observe(headerInner);
  ro.observe(siteMenu);
}
updateNavLayout();

siteMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (!siteHeader.classList.contains("is-wide") && typeof siteMenu.hidePopover === "function") {
      try {
        siteMenu.hidePopover();
      } catch {}
    }
  });
});

// Interactive System Architecture Tabs (tabs guide compliant)
const archTabs = Array.from(document.querySelectorAll('.tablist > [role="tab"]'));
const archPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

function selectArchTab(targetTab, { focus = false } = {}) {
  const targetPanel = archPanels.find((p) => p.getAttribute("aria-labelledby") === targetTab.id);
  for (const tab of archTabs) {
    const active = tab === targetTab;
    tab.ariaSelected = String(active);
    tab.toggleAttribute("focusgroupstart", active);
  }
  for (const panel of archPanels) {
    const match = panel === targetPanel;
    if (match) {
      panel.hidden = false;
      panel.tabIndex = 0;
    } else {
      panel.setAttribute("hidden", "until-found");
      panel.removeAttribute("tabindex");
    }
  }
  targetTab.scrollIntoView({ block: "nearest", inline: "nearest", container: "nearest" });
  if (focus) targetTab.focus();
}

for (const tab of archTabs) {
  tab.addEventListener("click", () => selectArchTab(tab));
  tab.addEventListener("focus", () => selectArchTab(tab));
  tab.addEventListener("keydown", (e) => {
    const idx = archTabs.indexOf(tab);
    let next = null;
    if (e.key === "ArrowRight") next = archTabs[(idx + 1) % archTabs.length];
    else if (e.key === "ArrowLeft") next = archTabs[(idx - 1 + archTabs.length) % archTabs.length];
    else if (e.key === "Home") next = archTabs[0];
    else if (e.key === "End") next = archTabs[archTabs.length - 1];
    if (next) {
      e.preventDefault();
      selectArchTab(next, { focus: true });
    }
  });
}

for (const panel of archPanels) {
  panel.addEventListener("beforematch", () => {
    const tab = archTabs.find((t) => t.id === panel.getAttribute("aria-labelledby"));
    if (tab) selectArchTab(tab, { focus: false });
  });
}

// Interactive Project Scope & Budget Estimator
const TRACK_DATA = {
  website: { label: "Business Website / Booking Site", minPhp: 15000, maxPhp: 35000, baseWeeks: 2, stack: "Static/Next.js · SEO · Messenger/Forms" },
  app: { label: "Custom Web or Mobile App", minPhp: 45000, maxPhp: 95000, baseWeeks: 4, stack: "TypeScript · React · REST/PostgreSQL" },
  erp: { label: "Full Business System / ERP / POS", minPhp: 65000, maxPhp: 150000, baseWeeks: 6, stack: ".NET / Node · Role-Based API · Postgres" },
  iot: { label: "IoT Hardware + Live Web Dashboard", minPhp: 55000, maxPhp: 135000, baseWeeks: 5, stack: "ESP32 / RFID / MQTT · Live Web Telemetry" }
};

const FEATURE_DELTAS = {
  rbac: { label: "Role-based staff access & audit logs", php: 10000, weeks: 1 },
  payments: { label: "Online payments & e-invoicing", php: 12000, weeks: 1 },
  alerts: { label: "Automated SMS, Email, or Messenger alerts", php: 8000, weeks: 0.5 },
  hardware: { label: "RFID, QR, barcode, or sensor integration", php: 18000, weeks: 1.5 },
  migration: { label: "Spreadsheet / legacy data migration", php: 7000, weeks: 0.5 }
};

const SCALE_META = {
  1: { label: "1 — Single team or pilot branch", mult: 1.0, weeks: 0 },
  2: { label: "2 — Growing SME (up to 3 branches)", mult: 1.15, weeks: 1 },
  3: { label: "3 — Multi-branch network (4–15 sites)", mult: 1.35, weeks: 2 },
  4: { label: "4 — Enterprise / multi-warehouse rollout", mult: 1.6, weeks: 3 }
};

const scopeForm = document.getElementById("scope-form");
const scaleInput = document.getElementById("scale-range");
const estBudgetEl = document.getElementById("est-budget");
const estTimelineEl = document.getElementById("est-timeline");
const estStackEl = document.getElementById("est-stack");
const briefOutEl = document.getElementById("brief-preview");
const copyBtn = document.getElementById("copy-brief");
const copyStatusEl = document.getElementById("copy-status");

function updateEstimate() {
  if (!scopeForm) return;
  const trackKey = scopeForm.querySelector('input[name="track"]:checked')?.value || "erp";
  const track = TRACK_DATA[trackKey] || TRACK_DATA.erp;
  const checkedMods = Array.from(scopeForm.querySelectorAll('input[name="features"]:checked')).map((el) => el.value);
  const scaleVal = Number(scaleInput?.value || 2);
  const scale = SCALE_META[scaleVal] || SCALE_META[2];

  if (scaleInput) {
    scaleInput.style.setProperty("--progress", ((scaleVal - 1) / 3) * 100 + "%");
  }

  let modPhp = 0;
  let modWeeks = 0;
  const modLabels = [];
  for (const key of checkedMods) {
    const f = FEATURE_DELTAS[key];
    if (f) {
      modPhp += f.php;
      modWeeks += f.weeks;
      modLabels.push("- " + f.label);
    }
  }

  const minTotal = Math.round((track.minPhp + modPhp) * scale.mult / 1000) * 1000;
  const maxTotal = Math.round((track.maxPhp + modPhp) * scale.mult / 1000) * 1000;
  const weeksLow = Math.max(2, Math.round(track.baseWeeks + modWeeks + scale.weeks));
  const weeksHigh = weeksLow + 2;

  estBudgetEl.textContent = "₱" + minTotal.toLocaleString("en-US") + " – ₱" + maxTotal.toLocaleString("en-US");
  estTimelineEl.textContent = weeksLow + "–" + weeksHigh + " weeks MVP";
  estStackEl.textContent = track.stack;

  const lines = [
    "DELMARO PROJECT SCOPE BRIEF",
    "Track: " + track.label,
    "Deployment Scale: " + scale.label,
    "Estimated Budget Range: " + estBudgetEl.textContent,
    "Target MVP Delivery: " + estTimelineEl.textContent,
    "Selected Capabilities:",
    ...(modLabels.length ? modLabels : ["- Core MVP workflows only"])
  ];
  briefOutEl.textContent = lines.join("\n");
}

scopeForm?.addEventListener("input", updateEstimate);
scopeForm?.addEventListener("change", updateEstimate);
updateEstimate();

copyBtn?.addEventListener("click", async () => {
  const text = briefOutEl?.textContent || "";
  try {
    await navigator.clipboard.writeText(text);
    copyStatusEl.textContent = "Brief copied. Paste into delmaro.tech Messenger to start your scope review.";
  } catch {
    copyStatusEl.textContent = "Select and copy the brief box above, then send via Messenger.";
  }
});
