// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
// Copyright (c) 2026 Atomicode® — Monitor Xpress

const { invoke } = window.__TAURI__.core;
const t = (k, p) => (window.MXi18n ? window.MXi18n.t(k, p) : k);

// ==============================
// UTILIDADES
// ==============================
function formatBytes(b) {
  if (b === 0) return "0 B";
  const u = ["B","KB","MB","GB","TB"];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(i > 2 ? 1 : 0)} ${u[i]}`;
}

function formatSpeed(bpi) {
  const bps = bpi / 1.5;
  if (bps < 1024) return `${bps.toFixed(0)} B/s`;
  if (bps < 1048576) return `${(bps / 1024).toFixed(1)} KB/s`;
  return `${(bps / 1048576).toFixed(2)} MB/s`;
}

function usageClass(p) { return p < 50 ? "low" : p < 80 ? "medium" : "high"; }
function tempClass(t) { return t < 60 ? "low" : t < 80 ? "medium" : "high"; }

// Returns actual hex colors based on current theme
function neonColor(name) {
  const dark = {
    blue:"#00d4ff", green:"#00ff87", purple:"#bf5fff", red:"#ff4757",
    yellow:"#ffc107", cyan:"#00e5ff", orange:"#ff6b35"
  };
  const light = {
    blue:"#0077cc", green:"#00915e", purple:"#7b2fba", red:"#cc2940",
    yellow:"#b88a00", cyan:"#008aa3", orange:"#c04d1a"
  };
  return isDark ? dark[name] : light[name];
}

function usageHex(p) { return p < 50 ? neonColor("green") : p < 80 ? neonColor("yellow") : neonColor("red"); }

// Chart color sets - real hex values
function chartColors() {
  if (isDark) {
    return {
      cpuLine:"#00d4ff", cpuFill:"rgba(0,180,255,0.12)",
      ramLine:"#bf5fff", ramFill:"rgba(160,80,255,0.12)",
      gpuLine:"#00ff87", gpuFill:"rgba(0,255,130,0.1)",
      tempLine:"#ff4757", tempFill:"rgba(255,71,87,0.05)",
      dlLine:"#00e5ff",  dlFill:"rgba(0,229,255,0.1)",
      ulLine:"#ff6b35",  ulFill:"rgba(255,107,53,0.06)",
      grid:"rgba(255,255,255,0.06)", text:"rgba(180,190,210,0.6)",
      legendText:"rgba(180,190,210,0.6)",
    };
  }
  return {
    cpuLine:"#0077cc", cpuFill:"rgba(0,119,204,0.15)",
    ramLine:"#7b2fba", ramFill:"rgba(123,47,186,0.12)",
    gpuLine:"#00915e", gpuFill:"rgba(0,145,94,0.12)",
    tempLine:"#cc2940", tempFill:"rgba(204,41,64,0.08)",
    dlLine:"#008aa3",  dlFill:"rgba(0,138,163,0.12)",
    ulLine:"#c04d1a",  ulFill:"rgba(192,77,26,0.1)",
    grid:"rgba(0,0,0,0.1)", text:"#6b7280",
    legendText:"#6b7280",
  };
}

// ==============================
// THEME
// ==============================
let isDark = localStorage.getItem("mx-theme") !== "light";

function applyTheme() {
  document.body.classList.toggle("theme-dark", isDark);
  document.body.classList.toggle("theme-light", !isDark);
  const ico = document.getElementById("theme-icon");
  const lbl = document.getElementById("theme-label");
  const sunSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  const moonSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  if (ico) ico.innerHTML = isDark ? sunSvg : moonSvg;
  if (lbl) lbl.textContent = isDark ? t("nav.theme.light") : t("nav.theme.dark");
  rebuildAllCharts();
}

function toggleTheme() {
  isDark = !isDark;
  localStorage.setItem("mx-theme", isDark ? "dark" : "light");
  applyTheme();
}

// ==============================
// VIEW MODES
// ==============================
let currentMode = localStorage.getItem("mx-mode") || "expanded";

function applyMode() {
  document.body.classList.remove("mode-expanded","mode-compact","mode-mini");
  document.body.classList.add("mode-" + currentMode);
  document.querySelectorAll(".dashboard-modes .mode-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.mode === currentMode);
  });
}

function setMode(mode) {
  currentMode = mode;
  localStorage.setItem("mx-mode", mode);
  applyMode();
}

// ==============================
// SIDEBAR
// ==============================
let sidebarCollapsed = localStorage.getItem("mx-sidebar") === "collapsed";

function applySidebar() {
  document.body.classList.toggle("sidebar-collapsed", sidebarCollapsed);
}

function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  localStorage.setItem("mx-sidebar", sidebarCollapsed ? "collapsed" : "expanded");
  applySidebar();
}

// ==============================
// VIEW NAVIGATION
// ==============================
let currentView = "dashboard";

function navigateTo(view) {
  currentView = view;
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const target = document.getElementById("view-" + view);
  if (target) target.classList.add("active");
  document.querySelectorAll(".nav-item[data-view]").forEach(a => {
    a.classList.toggle("active", a.dataset.view === view);
  });
  ensureDetailCharts(view);
}

// ==============================
// WINDOW CONTROLS (Custom title bar)
// ==============================
async function initWindowControls() {
  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    document.getElementById("tb-minimize").addEventListener("click", () => win.minimize());
    document.getElementById("tb-maximize").addEventListener("click", async () => {
      if (await win.isMaximized()) win.unmaximize();
      else win.maximize();
    });
    document.getElementById("tb-close").addEventListener("click", () => win.close());

    // Window dragging via JS (data-tauri-drag-region unreliable on Windows)
    const titlebar = document.querySelector(".titlebar");
    titlebar.addEventListener("mousedown", (e) => {
      // Don't drag if clicking on buttons
      if (e.target.closest(".titlebar-controls")) return;
      win.startDragging();
    });
    // Double-click to maximize/restore
    titlebar.addEventListener("dblclick", async (e) => {
      if (e.target.closest(".titlebar-controls")) return;
      if (await win.isMaximized()) win.unmaximize();
      else win.maximize();
    });
  } catch (e) {
    document.getElementById("tb-close").addEventListener("click", () => invoke("exit_app"));
  }
}

// ==============================
// CLICK TO NAVIGATE from dashboard cards
// ==============================
function initCardClicks() {
  const cardViewMap = { cpu:"cpu", ram:"ram", gpu:"gpu", fans:"fans", disks:"disks", mobo:"mobo", net:"net" };
  document.getElementById("dashboard").addEventListener("click", e => {
    // Don't navigate if clicking detail-toggle, or if drag just happened
    if (e.target.closest(".detail-toggle") || e.target.closest(".detail-section")) return;
    const card = e.target.closest(".card[data-card]");
    if (!card) return;
    const view = cardViewMap[card.dataset.card];
    if (view) navigateTo(view);
  });
}

// ==============================
// CHARTS
// ==============================
const MP = 40;
const tl = Array(MP).fill("");
const cpuH = Array(MP).fill(0), ramH = Array(MP).fill(0);
const gpuUH = Array(MP).fill(0), gpuTH = Array(MP).fill(0);
const dlH = Array(MP).fill(0), ulH = Array(MP).fill(0);
let netMax = 102400;

let cpuChart, ramChart, gpuChart, netChart;
let dcpuChart, dramChart, dgpuChart, dnetChart;

function baseOpts(max = 100, unit = "%") {
  const cc = chartColors();
  return {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 200 },
    scales: {
      x: { display: false },
      y: { min:0, max, ticks:{ color:cc.text, font:{size:9}, callback:v=>v+unit, stepSize:max/4 }, grid:{ color:cc.grid }, border:{ display:false } },
    },
    plugins: { legend:{ display:false }, tooltip:{ enabled:false } },
    elements: { point:{ radius:0 }, line:{ tension:0.4, borderWidth:2 } },
  };
}

function dualGpuOpts() {
  const cc = chartColors();
  return {
    responsive:true, maintainAspectRatio:false, animation:{duration:200},
    scales: {
      x: { display:false },
      y: { min:0, max:100, position:"left", ticks:{color:cc.gpuLine,font:{size:9},callback:v=>v+"%",stepSize:25}, grid:{color:cc.grid}, border:{display:false} },
      y1:{ min:20, max:100, position:"right", ticks:{color:cc.tempLine,font:{size:9},callback:v=>v+" C",stepSize:20}, grid:{display:false}, border:{display:false} },
    },
    plugins: { legend:{display:true,position:"top",labels:{color:cc.legendText,font:{size:9},boxWidth:10}}, tooltip:{enabled:false} },
    elements: { point:{radius:0}, line:{tension:0.4,borderWidth:2} },
  };
}

function netOpts() {
  const cc = chartColors();
  return {
    responsive:true, maintainAspectRatio:false, animation:{duration:200},
    scales: {
      x:{display:false},
      y:{min:0,max:netMax,ticks:{color:cc.text,font:{size:9},callback:v=>formatBytes(v)+"/s",stepSize:netMax/4},grid:{color:cc.grid},border:{display:false}},
    },
    plugins: { legend:{display:true,position:"top",labels:{color:cc.legendText,font:{size:9},boxWidth:10}}, tooltip:{enabled:false} },
    elements: { point:{radius:0}, line:{tension:0.4,borderWidth:2} },
  };
}

function destroyChart(c) { if (c) { c.destroy(); } return null; }

function buildDashboardCharts() {
  const cc = chartColors();

  cpuChart = new Chart(document.getElementById("cpu-chart").getContext("2d"), {
    type:"line", data:{ labels:tl, datasets:[{ data:[...cpuH], borderColor:cc.cpuLine, backgroundColor:cc.cpuFill, fill:true }] }, options:baseOpts(100,"%"),
  });

  ramChart = new Chart(document.getElementById("ram-chart").getContext("2d"), {
    type:"line", data:{ labels:tl, datasets:[{ data:[...ramH], borderColor:cc.ramLine, backgroundColor:cc.ramFill, fill:true }] }, options:baseOpts(100,"%"),
  });

  gpuChart = new Chart(document.getElementById("gpu-chart").getContext("2d"), {
    type:"line", data:{ labels:tl, datasets:[
      { label:"Uso", data:[...gpuUH], borderColor:cc.gpuLine, backgroundColor:cc.gpuFill, fill:true, yAxisID:"y" },
      { label:"Temp", data:[...gpuTH], borderColor:cc.tempLine, backgroundColor:cc.tempFill, fill:false, yAxisID:"y1" },
    ]}, options:dualGpuOpts(),
  });

  netChart = new Chart(document.getElementById("net-chart").getContext("2d"), {
    type:"line", data:{ labels:tl, datasets:[
      { label:"Descarga", data:[...dlH], borderColor:cc.dlLine, backgroundColor:cc.dlFill, fill:true },
      { label:"Subida", data:[...ulH], borderColor:cc.ulLine, backgroundColor:cc.ulFill, fill:true },
    ]}, options:netOpts(),
  });
}

function rebuildAllCharts() {
  // Destroy all existing charts
  cpuChart = destroyChart(cpuChart);
  ramChart = destroyChart(ramChart);
  gpuChart = destroyChart(gpuChart);
  netChart = destroyChart(netChart);
  dcpuChart = destroyChart(dcpuChart);
  dramChart = destroyChart(dramChart);
  dgpuChart = destroyChart(dgpuChart);
  dnetChart = destroyChart(dnetChart);
  // Rebuild dashboard charts with new colors
  buildDashboardCharts();
  // Rebuild active detail chart if needed
  ensureDetailCharts(currentView);
}

function ensureDetailCharts(view) {
  const cc = chartColors();
  if (view === "cpu" && !dcpuChart) {
    dcpuChart = new Chart(document.getElementById("dcpu-chart").getContext("2d"), {
      type:"line", data:{ labels:tl, datasets:[{ data:[...cpuH], borderColor:cc.cpuLine, backgroundColor:cc.cpuFill, fill:true }] }, options:baseOpts(100,"%"),
    });
  }
  if (view === "ram" && !dramChart) {
    dramChart = new Chart(document.getElementById("dram-chart").getContext("2d"), {
      type:"line", data:{ labels:tl, datasets:[{ data:[...ramH], borderColor:cc.ramLine, backgroundColor:cc.ramFill, fill:true }] }, options:baseOpts(100,"%"),
    });
  }
  if (view === "gpu" && !dgpuChart) {
    dgpuChart = new Chart(document.getElementById("dgpu-chart").getContext("2d"), {
      type:"line", data:{ labels:tl, datasets:[
        { label:"Uso", data:[...gpuUH], borderColor:cc.gpuLine, backgroundColor:cc.gpuFill, fill:true, yAxisID:"y" },
        { label:"Temp", data:[...gpuTH], borderColor:cc.tempLine, backgroundColor:cc.tempFill, fill:false, yAxisID:"y1" },
      ]}, options:dualGpuOpts(),
    });
  }
  if (view === "net" && !dnetChart) {
    dnetChart = new Chart(document.getElementById("dnet-chart").getContext("2d"), {
      type:"line", data:{ labels:tl, datasets:[
        { label:"Descarga", data:[...dlH], borderColor:cc.dlLine, backgroundColor:cc.dlFill, fill:true },
        { label:"Subida", data:[...ulH], borderColor:cc.ulLine, backgroundColor:cc.ulFill, fill:true },
      ]}, options:netOpts(),
    });
  }
}

// ==============================
// SENSOR CATEGORIZATION
// ==============================
function categorizeSensors(all) {
  const r = { cpu:[], gpu:[], fans:[], diskTemps:[], moboTemps:[], moboVolts:[], moboOther:[] };
  for (const s of all) {
    const n = s.name.toLowerCase(), t = s.sensor_type;
    if (t === "Fan") { r.fans.push(s); continue; }
    if (n.match(/ryzen|intel.*core|amd.*\d{4}/) && !n.match(/nvidia|geforce|radeon/)) { r.cpu.push(s); continue; }
    if (n.match(/nvidia|geforce|rtx\s?\d|gtx\s?\d|radeon\s?rx/)) { r.gpu.push(s); continue; }
    if (t === "Temperature" && n.match(/ssd|hdd|st\d|wd\d|samsung|ssstc|kingston|crucial|seagate|toshiba|intel.*sc|sandisk|nvme|m\.2/)) { r.diskTemps.push(s); continue; }
    if (t === "Temperature") r.moboTemps.push(s);
    else if (t === "Voltage") r.moboVolts.push(s);
    else r.moboOther.push(s);
  }
  return r;
}

// ==============================
// RENDER HELPERS
// ==============================
const typeMap = {
  "Temperature":{cls:"temp",label:"TEMP"}, "Fan":{cls:"fan",label:"FAN"}, "Power":{cls:"power",label:"PWR"},
  "Voltage":{cls:"voltage",label:"VOLT"}, "Clock":{cls:"clock",label:"CLK"}, "Load":{cls:"load",label:"CARGA"},
};

function renderSensorGrid(container, sensors, prefix) {
  if (!container) return;
  if (!sensors.length) { container.innerHTML = `<p class="no-sensors">${t("common.nodata")}</p>`; return; }
  if (container.children.length !== sensors.length) {
    container.innerHTML = "";
    sensors.forEach((_, i) => {
      const d = document.createElement("div"); d.className = "sensor-item";
      d.innerHTML = `<div class="sensor-item-left"><span class="sensor-name" id="${prefix}-n-${i}">--</span><span class="sensor-value" id="${prefix}-v-${i}">--</span></div><span class="sensor-type-badge" id="${prefix}-b-${i}">--</span>`;
      container.appendChild(d);
    });
  }
  sensors.forEach((s, i) => {
    const ne = document.getElementById(`${prefix}-n-${i}`), ve = document.getElementById(`${prefix}-v-${i}`), be = document.getElementById(`${prefix}-b-${i}`);
    if (!ne) return;
    let dn = s.name; const di = dn.lastIndexOf(" - "); if (di > 0) dn = dn.substring(di + 3);
    ne.textContent = dn; ne.title = s.name;
    ve.textContent = `${s.value.toFixed(1)} ${s.unit}`;
    const tm = typeMap[s.sensor_type] || {cls:"other",label:s.sensor_type};
    be.textContent = tm.label; be.className = `sensor-type-badge ${tm.cls}`;
    ve.className = s.sensor_type === "Temperature" ? `sensor-value ${tempClass(s.value)}` : "sensor-value";
  });
}

function renderFansTo(container, fans, prefix, countEl, hintEl) {
  if (!fans.length) {
    if (countEl) countEl.textContent = t("fans.none");
    if (hintEl) { hintEl.style.display = "block"; hintEl.textContent = t("fans.adminhint"); }
    return;
  }
  if (hintEl) hintEl.style.display = "none";
  const active = fans.filter(f => f.value > 0).length;
  if (countEl) countEl.textContent = t("fans.active_of", { a: active, n: fans.length });
  if (container.querySelectorAll(".fan-item").length !== fans.length) {
    container.innerHTML = "";
    fans.forEach((_, i) => {
      const d = document.createElement("div"); d.className = "fan-item";
      d.innerHTML = `<div class="fan-icon-container"><span class="fan-icon" id="${prefix}-ico-${i}">&#10054;</span></div><div class="fan-info"><span class="fan-name" id="${prefix}-nm-${i}">--</span><span class="fan-rpm" id="${prefix}-rpm-${i}">--</span></div><div class="fan-bar-container"><div class="fan-bar" id="${prefix}-bar-${i}"></div></div>`;
      container.appendChild(d);
    });
  }
  const maxR = Math.max(...fans.map(f => f.value), 1);
  fans.forEach((f, i) => {
    const ne = document.getElementById(`${prefix}-nm-${i}`), re = document.getElementById(`${prefix}-rpm-${i}`);
    const be = document.getElementById(`${prefix}-bar-${i}`), ie = document.getElementById(`${prefix}-ico-${i}`);
    if (!ne) return;
    let dn = f.name; const di = dn.lastIndexOf(" - "); if (di > 0) dn = dn.substring(di + 3);
    ne.textContent = dn; ne.title = f.name;
    re.textContent = f.value > 0 ? `${f.value.toFixed(0)} RPM` : t("fans.stopped");
    re.className = f.value > 0 ? "fan-rpm active" : "fan-rpm stopped";
    be.style.width = `${maxR > 0 ? (f.value/maxR)*100 : 0}%`;
    be.className = f.value > 0 ? "fan-bar spinning" : "fan-bar";
    ie.className = f.value > 0 ? "fan-icon spinning" : "fan-icon";
  });
}

function renderCoresTo(container, cores, prefix) {
  if (container.children.length !== cores.length) {
    container.innerHTML = "";
    cores.forEach((_, i) => {
      const d = document.createElement("div"); d.className = "core-bar";
      d.innerHTML = `<span class="core-label">C${i}</span><span class="core-value" id="${prefix}-cv-${i}">0%</span><div class="core-meter"><div class="core-meter-fill" id="${prefix}-cf-${i}"></div></div>`;
      container.appendChild(d);
    });
  }
  cores.forEach((c, i) => {
    const v = document.getElementById(`${prefix}-cv-${i}`), f = document.getElementById(`${prefix}-cf-${i}`);
    if (v && f) { v.textContent = `${c.usage.toFixed(0)}%`; v.style.color = usageHex(c.usage); f.style.width = `${c.usage}%`; f.style.background = usageHex(c.usage); }
  });
}

function renderDisksTo(container, disks, prefix) {
  if (container.children.length !== disks.length) {
    container.innerHTML = "";
    disks.forEach((_, i) => {
      const d = document.createElement("div"); d.className = "disk-item";
      d.innerHTML = `<div class="disk-item-header"><span class="disk-name" id="${prefix}-dn-${i}">--</span><div><span class="disk-mount" id="${prefix}-dm-${i}">--</span> <span class="disk-fs" id="${prefix}-df-${i}">--</span></div></div><div class="disk-details" id="${prefix}-dd-${i}">--</div><div class="disk-bar-container"><div class="disk-bar-fill" id="${prefix}-db-${i}"></div></div>`;
      container.appendChild(d);
    });
  }
  disks.forEach((dk, i) => {
    document.getElementById(`${prefix}-dn-${i}`).textContent = dk.name || t("disks.localdisk");
    document.getElementById(`${prefix}-dm-${i}`).textContent = dk.mount_point;
    document.getElementById(`${prefix}-df-${i}`).textContent = dk.fs_type;
    document.getElementById(`${prefix}-dd-${i}`).textContent = t("disks.detail", {
      used: formatBytes(dk.used), total: formatBytes(dk.total),
      free: formatBytes(dk.available), pct: dk.usage_percent.toFixed(1),
    });
    const fb = document.getElementById(`${prefix}-db-${i}`);
    fb.style.width = `${dk.usage_percent}%`;
    fb.className = dk.usage_percent > 85 ? "disk-bar-fill warn" : "disk-bar-fill";
  });
}

function renderNetIfacesTo(container, interfaces, prefix) {
  if (container.children.length !== interfaces.length) {
    container.innerHTML = "";
    interfaces.forEach((_, i) => {
      const d = document.createElement("div"); d.className = "net-iface";
      d.innerHTML = `<span class="net-iface-name" id="${prefix}-in-${i}">--</span><div class="net-iface-stats"><span id="${prefix}-ir-${i}">--</span><span id="${prefix}-it-${i}">--</span></div>`;
      container.appendChild(d);
    });
  }
  interfaces.forEach((iface, i) => {
    document.getElementById(`${prefix}-in-${i}`).textContent = iface.name;
    document.getElementById(`${prefix}-ir-${i}`).textContent = `\u2193 ${formatBytes(iface.received)}`;
    document.getElementById(`${prefix}-it-${i}`).textContent = `\u2191 ${formatBytes(iface.transmitted)}`;
  });
}

// ==============================
// MAIN UPDATE
// ==============================
function updateUI(info) {
  const { cpu, ram, gpu, disks, network, sensors } = info;
  const cat = categorizeSensors(sensors.sensors || []);

  const st = document.getElementById("status");
  st.textContent = t("status.online"); st.classList.remove("error");
  st.removeAttribute("data-i18n");

  // --- CPU ---
  document.getElementById("cpu-name").textContent = cpu.name;
  const cue = document.getElementById("cpu-usage");
  cue.textContent = `${cpu.global_usage.toFixed(1)}%`; cue.className = `stat-value ${usageClass(cpu.global_usage)}`;
  document.getElementById("cpu-usage-mini").textContent = `${cpu.global_usage.toFixed(0)}%`;
  document.getElementById("cpu-usage-mini").style.color = usageHex(cpu.global_usage);

  const cte = document.getElementById("cpu-temp"), ctm = document.getElementById("cpu-temp-mini");
  if (cpu.temperature > 0) { cte.textContent = `${cpu.temperature.toFixed(0)}\u00B0C`; cte.className = `stat-value ${tempClass(cpu.temperature)}`; ctm.textContent = `${cpu.temperature.toFixed(0)}\u00B0C`; }
  else { cte.textContent = t("common.nd"); cte.className = "stat-value"; ctm.textContent = ""; }
  document.getElementById("cpu-freq").textContent = `${cpu.frequency} MHz`;
  document.getElementById("cpu-cores").textContent = `${cpu.physical_cores}F/${cpu.logical_cores}L`;

  cpuH.push(cpu.global_usage); cpuH.shift();
  if (cpuChart) { cpuChart.data.datasets[0].data = [...cpuH]; cpuChart.update("none"); }
  renderCoresTo(document.getElementById("cores-grid"), cpu.cores, "c");

  if (cat.cpu.length > 0) { document.getElementById("cpu-details").style.display = ""; renderSensorGrid(document.getElementById("cpu-sensors-grid"), cat.cpu, "cs"); }
  else document.getElementById("cpu-details").style.display = "none";

  // --- RAM ---
  document.getElementById("ram-subtitle").textContent = `${formatBytes(ram.used)} / ${formatBytes(ram.total)}`;
  const rue = document.getElementById("ram-used");
  rue.textContent = formatBytes(ram.used); rue.className = `stat-value ${usageClass(ram.usage_percent)}`;
  document.getElementById("ram-available").textContent = formatBytes(ram.available);
  document.getElementById("ram-total").textContent = formatBytes(ram.total);
  document.getElementById("ram-bar").style.width = `${ram.usage_percent}%`;
  document.getElementById("ram-bar-text").textContent = `${ram.usage_percent.toFixed(1)}%`;
  document.getElementById("ram-usage-mini").textContent = `${ram.usage_percent.toFixed(0)}%`;
  document.getElementById("ram-usage-mini").style.color = usageHex(ram.usage_percent);
  ramH.push(ram.usage_percent); ramH.shift();
  if (ramChart) { ramChart.data.datasets[0].data = [...ramH]; ramChart.update("none"); }
  document.getElementById("swap-info").textContent = `${formatBytes(ram.swap_used)} / ${formatBytes(ram.swap_total)}`;

  // --- GPU ---
  if (gpu.available) {
    document.getElementById("gpu-name").textContent = gpu.name;
    const gue = document.getElementById("gpu-usage");
    gue.textContent = `${gpu.usage}%`; gue.className = `stat-value ${usageClass(gpu.usage)}`;
    document.getElementById("gpu-usage-mini").textContent = `${gpu.usage}%`;
    document.getElementById("gpu-usage-mini").style.color = usageHex(gpu.usage);
    const gte = document.getElementById("gpu-temp");
    gte.textContent = `${gpu.temperature}\u00B0C`; gte.className = `stat-value ${tempClass(gpu.temperature)}`;
    document.getElementById("gpu-temp-mini").textContent = `${gpu.temperature}\u00B0C`;
    const gfe = document.getElementById("gpu-fan");
    gfe.textContent = `${gpu.fan_speed}%`; gfe.className = `stat-value ${usageClass(gpu.fan_speed)}`;
    document.getElementById("gpu-vram-used").textContent = formatBytes(gpu.memory_used);
    document.getElementById("gpu-vram-total").textContent = formatBytes(gpu.memory_total);
    const gvp = document.getElementById("gpu-vram-percent");
    gvp.textContent = `${gpu.memory_percent.toFixed(1)}%`; gvp.className = `stat-value ${usageClass(gpu.memory_percent)}`;
    document.getElementById("gpu-vram-bar").style.width = `${gpu.memory_percent}%`;
    document.getElementById("gpu-vram-bar-text").textContent = `${gpu.memory_percent.toFixed(1)}%`;
    document.getElementById("gpu-power").textContent = `${gpu.power_usage.toFixed(1)} W`;
    document.getElementById("gpu-power-limit").textContent = `${gpu.power_limit.toFixed(0)} W`;
    document.getElementById("gpu-clock-gfx").textContent = `${gpu.clock_graphics} MHz`;
    document.getElementById("gpu-clock-mem").textContent = `${gpu.clock_memory} MHz`;
    gpuUH.push(gpu.usage); gpuUH.shift(); gpuTH.push(gpu.temperature); gpuTH.shift();
    if (gpuChart) { gpuChart.data.datasets[0].data = [...gpuUH]; gpuChart.data.datasets[1].data = [...gpuTH]; gpuChart.update("none"); }
    if (cat.gpu.length > 0) { document.getElementById("gpu-details").style.display = ""; renderSensorGrid(document.getElementById("gpu-sensors-grid"), cat.gpu, "gs"); }
    else document.getElementById("gpu-details").style.display = "none";
  } else {
    document.getElementById("gpu-name").textContent = t("gpu.notdetected");
    document.getElementById("gpu-body").style.opacity = "0.4";
  }

  // --- Fans ---
  renderFansTo(document.getElementById("fans-grid"), cat.fans, "f", document.getElementById("fans-count"), document.getElementById("fans-hint"));
  const fam = document.getElementById("fans-active-mini");
  if (fam) fam.textContent = cat.fans.length > 0 ? t("fans.act_short", { n: cat.fans.filter(f=>f.value>0).length }) : "0";

  // --- Discos ---
  document.getElementById("disk-count").textContent = t(disks.length === 1 ? "disks.units_one" : "disks.units_other", { n: disks.length });
  renderDisksTo(document.getElementById("disks-list"), disks, "d");
  if (cat.diskTemps.length > 0) { document.getElementById("disk-details").style.display = ""; renderSensorGrid(document.getElementById("disk-sensors-grid"), cat.diskTemps, "ds"); }
  else document.getElementById("disk-details").style.display = "none";

  // --- Mobo ---
  const ms = [...cat.moboTemps, ...cat.moboVolts, ...cat.moboOther][0];
  if (ms) document.getElementById("mobo-name").textContent = ms.name.substring(0, ms.name.indexOf(" - ")) || "Placa";
  if (cat.moboTemps.length > 0) { document.getElementById("mobo-temps-section").style.display = ""; renderSensorGrid(document.getElementById("mobo-temps-grid"), cat.moboTemps, "mt"); }
  else document.getElementById("mobo-temps-section").style.display = "none";
  if (cat.moboVolts.length > 0) { document.getElementById("mobo-volts-section").style.display = ""; renderSensorGrid(document.getElementById("mobo-volts-grid"), cat.moboVolts, "mv"); }
  else document.getElementById("mobo-volts-section").style.display = "none";
  if (cat.moboOther.length > 0) { document.getElementById("mobo-details").style.display = ""; renderSensorGrid(document.getElementById("mobo-other-grid"), cat.moboOther, "mo"); }
  else document.getElementById("mobo-details").style.display = "none";

  // --- Red ---
  document.getElementById("net-download").textContent = formatSpeed(network.download_speed);
  document.getElementById("net-upload").textContent = formatSpeed(network.upload_speed);
  document.getElementById("net-subtitle").textContent = t(network.interfaces.length === 1 ? "net.iface_count_one" : "net.iface_count_other", { n: network.interfaces.length });
  document.getElementById("net-total-rx").textContent = formatBytes(network.total_received);
  document.getElementById("net-total-tx").textContent = formatBytes(network.total_transmitted);
  document.getElementById("net-dl-mini").textContent = `\u2193${formatSpeed(network.download_speed)}`;
  document.getElementById("net-ul-mini").textContent = `\u2191${formatSpeed(network.upload_speed)}`;

  const dls = network.download_speed / 1.5, uls = network.upload_speed / 1.5;
  dlH.push(dls); dlH.shift(); ulH.push(uls); ulH.shift();
  const mx = Math.max(...dlH, ...ulH, 1024);
  netMax = Math.ceil(mx / 1024) * 1024 * 1.2;
  if (netChart) {
    netChart.options.scales.y.max = netMax;
    netChart.options.scales.y.ticks.callback = v => formatBytes(v) + "/s";
    netChart.options.scales.y.ticks.stepSize = netMax / 4;
    netChart.data.datasets[0].data = [...dlH]; netChart.data.datasets[1].data = [...ulH]; netChart.update("none");
  }
  renderNetIfacesTo(document.getElementById("net-interfaces"), network.interfaces, "ni");

  // --- DETAIL VIEWS (only active) ---
  if (currentView === "cpu") {
    document.getElementById("dcpu-name").textContent = cpu.name;
    const du = document.getElementById("dcpu-usage"); du.textContent = `${cpu.global_usage.toFixed(1)}%`; du.className = `stat-value ${usageClass(cpu.global_usage)}`;
    const dt = document.getElementById("dcpu-temp");
    if (cpu.temperature > 0) { dt.textContent = `${cpu.temperature.toFixed(0)}\u00B0C`; dt.className = `stat-value ${tempClass(cpu.temperature)}`; }
    else { dt.textContent = t("common.nd"); dt.className = "stat-value"; }
    document.getElementById("dcpu-freq").textContent = `${cpu.frequency} MHz`;
    document.getElementById("dcpu-cores").textContent = `${cpu.physical_cores}F / ${cpu.logical_cores}L`;
    if (dcpuChart) { dcpuChart.data.datasets[0].data = [...cpuH]; dcpuChart.update("none"); }
    renderCoresTo(document.getElementById("dcpu-cores-grid"), cpu.cores, "dc");
    renderSensorGrid(document.getElementById("dcpu-sensors-grid"), cat.cpu, "dcs");
  }

  if (currentView === "ram") {
    const du = document.getElementById("dram-used"); du.textContent = formatBytes(ram.used); du.className = `stat-value ${usageClass(ram.usage_percent)}`;
    document.getElementById("dram-available").textContent = formatBytes(ram.available);
    document.getElementById("dram-total").textContent = formatBytes(ram.total);
    const dp = document.getElementById("dram-percent"); dp.textContent = `${ram.usage_percent.toFixed(1)}%`; dp.className = `stat-value ${usageClass(ram.usage_percent)}`;
    document.getElementById("dram-bar").style.width = `${ram.usage_percent}%`;
    document.getElementById("dram-bar-text").textContent = `${ram.usage_percent.toFixed(1)}%`;
    document.getElementById("dram-swap-used").textContent = formatBytes(ram.swap_used);
    document.getElementById("dram-swap-total").textContent = formatBytes(ram.swap_total);
    if (dramChart) { dramChart.data.datasets[0].data = [...ramH]; dramChart.update("none"); }
  }

  if (currentView === "gpu" && gpu.available) {
    document.getElementById("dgpu-name").textContent = gpu.name;
    const du = document.getElementById("dgpu-usage"); du.textContent = `${gpu.usage}%`; du.className = `stat-value ${usageClass(gpu.usage)}`;
    const dt = document.getElementById("dgpu-temp"); dt.textContent = `${gpu.temperature}\u00B0C`; dt.className = `stat-value ${tempClass(gpu.temperature)}`;
    document.getElementById("dgpu-fan").textContent = `${gpu.fan_speed}%`;
    document.getElementById("dgpu-power").textContent = `${gpu.power_usage.toFixed(1)} W`;
    document.getElementById("dgpu-vram-used").textContent = formatBytes(gpu.memory_used);
    document.getElementById("dgpu-vram-total").textContent = formatBytes(gpu.memory_total);
    const dvp = document.getElementById("dgpu-vram-pct"); dvp.textContent = `${gpu.memory_percent.toFixed(1)}%`; dvp.className = `stat-value ${usageClass(gpu.memory_percent)}`;
    document.getElementById("dgpu-vram-bar").style.width = `${gpu.memory_percent}%`;
    document.getElementById("dgpu-vram-text").textContent = `${gpu.memory_percent.toFixed(1)}%`;
    document.getElementById("dgpu-clock-gfx").textContent = `${gpu.clock_graphics} MHz`;
    document.getElementById("dgpu-clock-mem").textContent = `${gpu.clock_memory} MHz`;
    document.getElementById("dgpu-power-limit").textContent = `${gpu.power_limit.toFixed(0)} W`;
    if (dgpuChart) { dgpuChart.data.datasets[0].data = [...gpuUH]; dgpuChart.data.datasets[1].data = [...gpuTH]; dgpuChart.update("none"); }
    renderSensorGrid(document.getElementById("dgpu-sensors-grid"), cat.gpu, "dgs");
  }

  if (currentView === "disks") {
    document.getElementById("ddisk-count").textContent = t(disks.length === 1 ? "disks.units_one" : "disks.units_other", { n: disks.length });
    renderDisksTo(document.getElementById("ddisk-list"), disks, "dd");
    renderSensorGrid(document.getElementById("ddisk-temps-grid"), cat.diskTemps, "ddt");
  }

  if (currentView === "fans") {
    renderFansTo(document.getElementById("dfans-grid"), cat.fans, "df", document.getElementById("dfans-count"), null);
  }

  if (currentView === "mobo") {
    if (ms) document.getElementById("dmobo-name").textContent = ms.name.substring(0, ms.name.indexOf(" - ")) || "Placa";
    renderSensorGrid(document.getElementById("dmobo-temps-grid"), cat.moboTemps, "dmt");
    renderSensorGrid(document.getElementById("dmobo-volts-grid"), cat.moboVolts, "dmv");
    renderSensorGrid(document.getElementById("dmobo-other-grid"), cat.moboOther, "dmo");
  }

  if (currentView === "net") {
    document.getElementById("dnet-download").textContent = formatSpeed(network.download_speed);
    document.getElementById("dnet-upload").textContent = formatSpeed(network.upload_speed);
    document.getElementById("dnet-count").textContent = t(network.interfaces.length === 1 ? "net.iface_count_one" : "net.iface_count_other", { n: network.interfaces.length });
    document.getElementById("dnet-total-rx").textContent = formatBytes(network.total_received);
    document.getElementById("dnet-total-tx").textContent = formatBytes(network.total_transmitted);
    if (dnetChart) {
      dnetChart.options.scales.y.max = netMax; dnetChart.options.scales.y.ticks.callback = v => formatBytes(v)+"/s"; dnetChart.options.scales.y.ticks.stepSize = netMax/4;
      dnetChart.data.datasets[0].data = [...dlH]; dnetChart.data.datasets[1].data = [...ulH]; dnetChart.update("none");
    }
    renderNetIfacesTo(document.getElementById("dnet-interfaces"), network.interfaces, "dni");
  }
}

// ==============================
// POLLING
// ==============================
async function fetchData() {
  try {
    const info = await invoke("get_system_info");
    updateUI(info);
  } catch (err) {
    console.error("Error:", err);
    const s = document.getElementById("status"); s.textContent = t("status.error"); s.classList.add("error");
  }
}

// ==============================
// INIT
// ==============================
window.addEventListener("DOMContentLoaded", () => {
  if (window.MXi18n) window.MXi18n.applyI18n();
  applyTheme();
  applyMode();
  applySidebar();
  initLangSelector();

  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("sidebar-toggle").addEventListener("click", toggleSidebar);
  document.getElementById("exit-btn").addEventListener("click", () => invoke("exit_app"));

  document.querySelectorAll(".dashboard-modes .mode-btn").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  document.querySelectorAll(".sidebar-nav .nav-item").forEach(a => a.addEventListener("click", () => navigateTo(a.dataset.view)));
  document.querySelectorAll(".sidebar-footer .nav-item[data-view]").forEach(a => a.addEventListener("click", () => navigateTo(a.dataset.view)));

  initWindowControls();
  initCardClicks();
  initWidgetToggle();
  // Charts are already built by applyTheme() -> rebuildAllCharts()
  fetchData();
  setInterval(fetchData, 1500);
});

// ==============================
// LANGUAGE SELECTOR
// ==============================
function initLangSelector() {
  const btn = document.getElementById("lang-toggle");
  const menu = document.getElementById("lang-menu");
  const label = document.getElementById("lang-label");
  if (!btn || !menu || !label || !window.MXi18n) return;

  const LANGS = window.MXi18n.getLangs();
  const refreshLabel = () => {
    const cur = window.MXi18n.getLang();
    label.textContent = (LANGS[cur] && LANGS[cur].short) || cur.toUpperCase();
    menu.querySelectorAll(".lang-option").forEach((o) => {
      o.classList.toggle("active", o.dataset.lang === cur);
    });
  };
  refreshLabel();

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (e.target.closest(".lang-option")) return;
    menu.classList.toggle("open");
  });

  menu.querySelectorAll(".lang-option").forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      window.MXi18n.setLang(opt.dataset.lang);
      menu.classList.remove("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target)) menu.classList.remove("open");
  });

  window.MXi18n.onLangChange((code) => {
    refreshLabel();
    applyTheme(); // refresh theme label text
    // Re-run data-driven updates so dynamic strings (status, counts) translate
    fetchData();
    // Notify widget window (if open) to sync language
    try { window.__TAURI__.event.emit("mx-lang-changed", code); } catch (e) {}
  });
}

// ==============================
// FLOATING WIDGET
// ==============================
function initWidgetToggle() {
  const btn = document.getElementById("widget-toggle-btn");
  const modal = document.getElementById("widget-modal");
  const cancel = document.getElementById("widget-modal-cancel");
  const accept = document.getElementById("widget-modal-accept");
  if (!btn || !modal) return;

  const close = () => modal.classList.remove("active");
  btn.addEventListener("click", () => modal.classList.add("active"));
  cancel.addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });

  accept.addEventListener("click", async () => {
    close();
    try {
      const { WebviewWindow } = window.__TAURI__.webviewWindow;
      const { getCurrentWindow } = window.__TAURI__.window;
      const { listen } = window.__TAURI__.event;

      // Create widget window if it doesn't exist
      let widget = await WebviewWindow.getByLabel("widget");
      if (!widget) {
        widget = new WebviewWindow("widget", {
          url: "widget.html",
          title: "MX Widget",
          width: 230,
          height: 230,
          minWidth: 200,
          minHeight: 200,
          decorations: false,
          transparent: true,
          alwaysOnTop: true,
          resizable: true,
          skipTaskbar: false,
          shadow: false,
        });
        widget.once("tauri://error", (e) => console.error("Widget creation error:", e));
      } else {
        await widget.show();
        await widget.setFocus();
      }

      // Hide main window
      await getCurrentWindow().hide();

      // Listen for return-to-main event from widget (only register once)
      if (!window.__mxWidgetListenerSet) {
        window.__mxWidgetListenerSet = true;
        await listen("show-main-window", async () => {
          await getCurrentWindow().show();
          await getCurrentWindow().setFocus();
        });
      }
    } catch (err) {
      console.error("Widget error:", err);
      alert(t("modal.widget.error") + " " + err);
    }
  });
}
