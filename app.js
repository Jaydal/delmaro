// Priority+ Adaptive Navbar (navbar guide compliant)
const siteHeader = document.querySelector(".site-header");
const headerInner = document.querySelector(".header-inner");
const siteMenu = document.getElementById("site-menu");

let lastMeasuredWidth = -1;
function updateNavLayout() {
  if (!siteHeader || !headerInner || !siteMenu) return;
  const currentWidth = headerInner.clientWidth;
  if (lastMeasuredWidth !== -1 && Math.abs(currentWidth - lastMeasuredWidth) < 2) {
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

// Interactive Sample Preview Tabs (tabs guide compliant)
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

// Live Working Sample Gallery Interactions
const SITE_SAMPLES = {
  cafe: {
    name: "Kapehan & Pastries PH",
    note: "Iced Spanish Latte (₱130) • Croissant Box (₱390) • Open 8AM–9PM • Order via Messenger"
  },
  clinic: {
    name: "SmileCare Dental Clinic",
    note: "Cleaning (₱1,000) • Braces Consult (Free) • Book 10AM / 2PM Slot • Map & GCash Info"
  },
  services: {
    name: "CoolAir Cleaning & Repair",
    note: "Split-Type Cleaning (₱950) • Same-Day Home Service • Warranty & Request Form"
  }
};

const sitePreviewEl = document.getElementById("sample-site-preview");
document.querySelectorAll("[data-site-kind]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const kind = btn.getAttribute("data-site-kind");
    const info = SITE_SAMPLES[kind];
    if (!info || !sitePreviewEl) return;
    document.querySelectorAll("[data-site-kind]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b === btn));
    });
    sitePreviewEl.innerHTML = "<strong>" + info.name + "</strong><br>" + info.note;
  });
});

let sampleStock = 14;
let sampleSalesTotal = 12450;
const stockBtn = document.getElementById("sample-sale-btn");
const resetStockBtn = document.getElementById("sample-reset-btn");
const stockReadoutEl = document.getElementById("sample-stock-log");

function renderStockDemo() {
  if (!stockReadoutEl) return;
  const alertLine = sampleStock <= 11
    ? "REORDER ALERT: Stock down to " + sampleStock + " (SMS ready for supplier)"
    : "Status: Stock healthy (" + sampleStock + " pcs in Main Warehouse)";
  stockReadoutEl.textContent = "Today's Sales: ₱" + sampleSalesTotal.toLocaleString("en-US") + " | " + alertLine;
}

stockBtn?.addEventListener("click", () => {
  if (sampleStock > 0) {
    sampleStock -= 1;
    sampleSalesTotal += 850;
  }
  renderStockDemo();
});

resetStockBtn?.addEventListener("click", () => {
  sampleStock = 14;
  sampleSalesTotal = 12450;
  renderStockDemo();
});

const iotLogEl = document.getElementById("sample-iot-log");
document.getElementById("sample-temp-btn")?.addEventListener("click", () => {
  if (iotLogEl) {
    iotLogEl.textContent = "ALERT: Chiller #2 warmed to +2.4°C — phone & SMS alert sent to Manager immediately.";
  }
});
document.getElementById("sample-rfid-btn")?.addEventListener("click", () => {
  if (iotLogEl) {
    iotLogEl.textContent = "LOGGED: Staff Card #014 (Ana R.) tapped in at 08:02 AM — synced straight to payroll sheet.";
  }
});

// Transparent Quote Calculator
const TRACK_DATA = {
  starter: {
    label: "Starter Business Website (₱500 Promo)",
    minPhp: 500,
    maxPhp: 3500,
    baseWeeks: 0.7,
    included: "Custom mobile-friendly page, free web address, contact/Messenger button, fast setup"
  },
  website: {
    label: "Booking & Ordering Website / Client Portal",
    minPhp: 15000,
    maxPhp: 35000,
    baseWeeks: 2,
    included: "Customer booking/order flow, Google-ready business pages, owner inbox & team walkthrough"
  },
  app: {
    label: "Custom Business System (Inventory / Sales / Payroll)",
    minPhp: 45000,
    maxPhp: 95000,
    baseWeeks: 4,
    included: "Live working preview first, daily sales/stock/payroll dashboard, staff training, full ownership"
  },
  erp: {
    label: "Complete Multi-Branch System + Web/Mobile App",
    minPhp: 65000,
    maxPhp: 150000,
    baseWeeks: 6,
    included: "All branches synced in real time, approvals ledger, downloadable owner reports, 30-day warranty"
  },
  iot: {
    label: "Smart Hardware, RFID Attendance or Sensor Monitoring",
    minPhp: 55000,
    maxPhp: 135000,
    baseWeeks: 5,
    included: "Configured hardware sensors/readers, live dashboard + phone alerts, staff orientation"
  }
};

const FEATURE_DELTAS = {
  rbac: { label: "Separate logins & activity history for staff", php: 10000, weeks: 1 },
  ai: { label: "AI auto-reply helper & receipt/doc sorting", php: 15000, weeks: 1 },
  payments: { label: "GCash / Maya / Bank online payments + receipts", php: 12000, weeks: 1 },
  alerts: { label: "Automatic SMS, Email, or Messenger updates", php: 8000, weeks: 0.5 },
  hardware: { label: "QR, barcode, RFID card, or sensor link", php: 18000, weeks: 1.5 },
  migration: { label: "Move existing Excel / paper records cleanly", php: 7000, weeks: 0.5 }
};

const SCALE_META = {
  1: { label: "1 Shop or Small Team", mult: 1.0, weeks: 0 },
  2: { label: "2–3 Branches", mult: 1.15, weeks: 1 },
  3: { label: "4–15 Branches", mult: 1.35, weeks: 2 },
  4: { label: "Large Multi-Warehouse Company", mult: 1.6, weeks: 3 }
};

const PRESETS = {
  starter: { track: "starter", features: [], scale: 1 },
  booking: { track: "website", features: ["payments", "alerts"], scale: 1 },
  inventory: { track: "app", features: ["rbac", "migration"], scale: 2 },
  iot: { track: "iot", features: ["hardware", "alerts"], scale: 2 }
};

const scopeForm = document.getElementById("scope-form");
const scaleInput = document.getElementById("scale-range");
const estBudgetEl = document.getElementById("est-budget");
const estTimelineEl = document.getElementById("est-timeline");
const estIncludedEl = document.getElementById("est-included");
const briefOutEl = document.getElementById("brief-preview");
const copyBtn = document.getElementById("copy-brief");
const copyStatusEl = document.getElementById("copy-status");

function roundBudget(val) {
  return val < 5000 ? Math.max(500, Math.round(val / 500) * 500) : Math.round(val / 1000) * 1000;
}

function updateEstimate() {
  if (!scopeForm) return;
  const trackKey = scopeForm.querySelector('input[name="track"]:checked')?.value || "app";
  const track = TRACK_DATA[trackKey] || TRACK_DATA.app;
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

  const minTotal = roundBudget((track.minPhp + modPhp) * (trackKey === "starter" && modPhp === 0 ? 1 : scale.mult));
  const maxTotal = roundBudget((track.maxPhp + modPhp) * scale.mult);
  const totalWeeks = track.baseWeeks + modWeeks + (trackKey === "starter" && modPhp === 0 ? 0 : scale.weeks);
  const weeksLow = Math.max(1, Math.round(totalWeeks));
  const weeksHigh = weeksLow + 2;

  estBudgetEl.textContent = "₱" + minTotal.toLocaleString("en-US") + " – ₱" + maxTotal.toLocaleString("en-US");
  estTimelineEl.textContent = totalWeeks < 1.2 ? "3–7 days launch" : weeksLow + "–" + weeksHigh + " weeks";
  if (estIncludedEl) estIncludedEl.textContent = track.included;

  const lines = [
    "DELMARO PROJECT QUOTE REQUEST",
    "Package: " + track.label,
    "Business Size: " + scale.label,
    "Sample Quote Range: " + estBudgetEl.textContent,
    "Target Delivery: " + estTimelineEl.textContent,
    "Requested Features:",
    ...(modLabels.length ? modLabels : ["- Base package essentials only"])
  ];
  briefOutEl.textContent = lines.join("\n");
}

document.querySelectorAll("[data-preset]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-preset");
    const preset = PRESETS[key];
    if (!preset || !scopeForm) return;
    const radio = scopeForm.querySelector('input[name="track"][value="' + preset.track + '"]');
    if (radio) radio.checked = true;
    scopeForm.querySelectorAll('input[name="features"]').forEach((cb) => {
      cb.checked = preset.features.includes(cb.value);
    });
    if (scaleInput) scaleInput.value = String(preset.scale);
    updateEstimate();
  });
});

scopeForm?.addEventListener("input", updateEstimate);
scopeForm?.addEventListener("change", updateEstimate);
updateEstimate();

copyBtn?.addEventListener("click", async () => {
  const text = briefOutEl?.textContent || "";
  try {
    await navigator.clipboard.writeText(text);
    copyStatusEl.textContent = "Quote summary copied. Paste this straight into delmaro.tech Messenger!";
  } catch {
    copyStatusEl.textContent = "Copy the summary box above and send it to us on Messenger.";
  }
});
