/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (c) 2026 Atomicode® — Monitor Xpress */

(function () {
  const LANGS = {
    es: { code: "es", name: "Español", short: "ES" },
    en: { code: "en", name: "English", short: "EN" },
  };

  const TRANSLATIONS = {
    es: {
      // sidebar
      "sidebar.toggle":            "Ocultar menú",
      "nav.dashboard":             "Dashboard",
      "nav.cpu":                   "CPU",
      "nav.ram":                   "RAM",
      "nav.gpu":                   "GPU",
      "nav.disks":                 "Discos",
      "nav.fans":                  "Ventiladores",
      "nav.mobo":                  "Placa Base",
      "nav.net":                   "Red",
      "nav.about":                 "Acerca de",
      "nav.theme.light":           "Claro",
      "nav.theme.dark":            "Oscuro",
      "nav.lang":                  "Idioma",
      "nav.exit":                  "Salir",

      // dashboard header
      "view.dashboard":            "Dashboard",
      "mode.expanded":             "Expandido",
      "mode.compact":              "Compacto",
      "mode.mini":                 "Mini",
      "widget.btn":                "Widget Flotante",
      "widget.btn_title":          "Activar widget flotante",
      "badge.beta":                "BETA",
      "status.connecting":         "Conectando...",
      "status.online":             "En línea",
      "status.error":              "Error",

      // common card labels
      "label.usage":               "Uso",
      "label.temp":                "Temp",
      "label.freq":                "Freq",
      "label.cores":               "Núcleos",
      "label.used":                "Usada",
      "label.available":           "Disponible",
      "label.total":               "Total",
      "label.fan":                 "Fan",
      "label.consumption":         "Consumo",
      "label.limit":               "Límite",
      "label.clock":               "Clock",
      "label.mem":                 "Mem",
      "label.download":            "Descarga",
      "label.upload":              "Subida",
      "label.swap":                "Swap:",
      "label.percent":             "%",
      "label.totalRx":             "Total Rx",
      "label.totalTx":             "Total Tx",

      // CPU card
      "cpu.detailed":              "Sensores detallados del CPU",

      // GPU card
      "gpu.detailed":              "Sensores detallados de la GPU",
      "gpu.notdetected":           "No detectada",

      // Fans card
      "fans.loading":              "Cargando...",
      "fans.none":                 "Sin ventiladores",
      "fans.adminhint":            "Ejecuta como administrador para detectar.",
      "fans.active_of":            "{a} activos de {n}",
      "fans.stopped":              "Detenido",
      "fans.act_short":            "{n} act.",

      // Disks card
      "disks.temps":               "Temperaturas de discos",
      "disks.localdisk":           "Disco local",
      "disks.units_one":           "{n} unidad",
      "disks.units_other":         "{n} unidades",
      "disks.detail":              "{used} de {total} | {free} libres | {pct}%",

      // Mobo
      "mobo.temperatures":         "Temperaturas",
      "mobo.voltages":             "Voltajes",
      "mobo.other":                "Otros sensores",
      "mobo.other_title":          "Otros Sensores",

      // Net
      "net.interfaces":            "Interfaces",
      "net.iface_count_one":       "{n} interfaz",
      "net.iface_count_other":     "{n} interfaces",

      // Detail views
      "detail.cpu.global":         "Uso Global",
      "detail.cpu.temperature":    "Temperatura",
      "detail.cpu.frequency":      "Frecuencia",
      "detail.cpu.usage_core":     "Uso por núcleo",
      "detail.cpu.sensors":        "Sensores del CPU",
      "detail.ram.percent":        "Porcentaje",
      "detail.ram.swap_used":      "Swap Usado",
      "detail.ram.swap_total":     "Swap Total",
      "detail.gpu.clocks":         "Relojes y Límites",
      "detail.gpu.clock_gpu":      "Clock GPU",
      "detail.gpu.clock_mem":      "Clock MEM",
      "detail.gpu.power_limit":    "Límite W",
      "detail.gpu.sensors":        "Sensores de la GPU",

      // common
      "common.nodata":             "Sin datos",
      "common.nd":                 "N/D",

      // About
      "about.title":               "Acerca de",
      "about.tagline":             "Monitorización de hardware en tiempo real",
      "about.developed_by_html":   "Desarrollado por <a href=\"https://www.atomicode.net\" target=\"_blank\" class=\"footer-link\">Atomicode®</a>",
      "about.license.title":       "Licencia",
      "about.license.body1_html":  "Monitor Xpress es software libre distribuido bajo la <strong>Mozilla Public License 2.0 (MPL-2.0)</strong>.",
      "about.license.body2":       "Su código fuente es abierto y puede ser utilizado, modificado y redistribuido bajo los términos de dicha licencia. Este proyecto no tiene fines de lucro.",
      "about.license.read":        "Leer licencia completa (MPL-2.0)",
      "about.privacy.title":       "Política de privacidad",
      "about.privacy.body1_html":  "<strong>Monitor Xpress NO recopila, transmite ni almacena datos personales.</strong>",
      "about.privacy.body2":       "Toda la información de hardware se procesa exclusivamente de forma local en tu equipo. No se envían datos a servidores externos. No se utilizan cookies, rastreadores ni herramientas de analítica.",
      "about.privacy.body3":       "Las métricas en tiempo real se mantienen en memoria durante la ejecución y se descartan al cerrar la aplicación. Las preferencias de interfaz (tema, idioma, modo de vista) se guardan localmente en tu equipo.",
      "about.privacy.body4":       "El permiso de administrador es necesario exclusivamente para la lectura de sensores de hardware mediante LibreHardwareMonitor. No se utiliza para ningún otro propósito.",
      "about.legal.title":         "Aviso legal",
      "about.legal.body_html":     "Este software se proporciona <strong>\"tal cual\"</strong>, sin garantías de ningún tipo, expresas o implícitas. Atomicode® no será responsable de daños directos, indirectos, incidentales o consecuentes derivados del uso de este software.",
      "about.credits.title":       "Reconocimientos",
      "about.credits.component":   "Componente",
      "about.credits.license":     "Licencia",
      "about.credits.use":         "Uso",
      "about.credits.use_lhm":     "Lectura de sensores de hardware",
      "about.credits.use_tauri":   "Framework de aplicación de escritorio",
      "about.credits.use_chart":   "Gráficas en tiempo real",
      "about.credits.use_sysinfo": "Información de CPU, RAM, discos y red",
      "about.credits.use_nvml":    "Monitorización GPU NVIDIA",
      "about.contact.title":       "Contacto",
      "about.contact.email":       "Correo:",
      "about.contact.web":         "Web:",

      // Footer
      "footer.project_by_html":    "Un proyecto de <a href=\"https://www.atomicode.net\" target=\"_blank\" class=\"footer-link\">Atomicode®</a>",
      "footer.sensors_by_html":    "Sensores via <a href=\"https://github.com/LibreHardwareMonitor/LibreHardwareMonitor\" target=\"_blank\" class=\"footer-link\">LibreHardwareMonitor</a>",

      // Widget modal
      "modal.widget.title":            "Widget Flotante",
      "modal.widget.text1_html":       "Esta función se encuentra en <strong>fase de pruebas</strong> y puede afectar el rendimiento del sistema o presentar comportamientos inesperados.",
      "modal.widget.text2":            "Al activarlo, se abrirá una ventana flotante con las métricas principales y se ocultará la ventana principal de Monitor Xpress.",
      "modal.widget.text3":            "¿Deseas continuar?",
      "modal.widget.cancel":           "Rechazar",
      "modal.widget.accept":           "Aceptar",
      "modal.widget.error":            "No se pudo abrir el widget flotante:",

      // Floating widget window
      "widget.app_title":          "MONITOR XPRESS",
      "widget.back_title":         "Volver a la app",
      "widget.close_title":        "Cerrar widget",
      "widget.label.cpu":          "CPU",
      "widget.label.ram":          "RAM",
      "widget.label.gpu":          "GPU",
      "widget.label.temp":         "Temp",
      "widget.label.freq":         "Freq",
      "widget.label.used":         "Usada",
      "widget.label.available":    "Disponible",
      "widget.label.consumption":  "Consumo",
    },

    en: {
      // sidebar
      "sidebar.toggle":            "Hide menu",
      "nav.dashboard":             "Dashboard",
      "nav.cpu":                   "CPU",
      "nav.ram":                   "RAM",
      "nav.gpu":                   "GPU",
      "nav.disks":                 "Disks",
      "nav.fans":                  "Fans",
      "nav.mobo":                  "Motherboard",
      "nav.net":                   "Network",
      "nav.about":                 "About",
      "nav.theme.light":           "Light",
      "nav.theme.dark":            "Dark",
      "nav.lang":                  "Language",
      "nav.exit":                  "Exit",

      // dashboard header
      "view.dashboard":            "Dashboard",
      "mode.expanded":             "Expanded",
      "mode.compact":              "Compact",
      "mode.mini":                 "Mini",
      "widget.btn":                "Floating Widget",
      "widget.btn_title":          "Open floating widget",
      "badge.beta":                "BETA",
      "status.connecting":         "Connecting...",
      "status.online":             "Online",
      "status.error":              "Error",

      // common card labels
      "label.usage":               "Usage",
      "label.temp":                "Temp",
      "label.freq":                "Freq",
      "label.cores":               "Cores",
      "label.used":                "Used",
      "label.available":           "Available",
      "label.total":               "Total",
      "label.fan":                 "Fan",
      "label.consumption":         "Power",
      "label.limit":               "Limit",
      "label.clock":               "Clock",
      "label.mem":                 "Mem",
      "label.download":            "Download",
      "label.upload":              "Upload",
      "label.swap":                "Swap:",
      "label.percent":             "%",
      "label.totalRx":             "Total Rx",
      "label.totalTx":             "Total Tx",

      // CPU card
      "cpu.detailed":              "Detailed CPU sensors",

      // GPU card
      "gpu.detailed":              "Detailed GPU sensors",
      "gpu.notdetected":           "Not detected",

      // Fans card
      "fans.loading":              "Loading...",
      "fans.none":                 "No fans",
      "fans.adminhint":            "Run as administrator to detect.",
      "fans.active_of":            "{a} active of {n}",
      "fans.stopped":              "Stopped",
      "fans.act_short":            "{n} act.",

      // Disks card
      "disks.temps":               "Disk temperatures",
      "disks.localdisk":           "Local disk",
      "disks.units_one":           "{n} drive",
      "disks.units_other":         "{n} drives",
      "disks.detail":              "{used} of {total} | {free} free | {pct}%",

      // Mobo
      "mobo.temperatures":         "Temperatures",
      "mobo.voltages":             "Voltages",
      "mobo.other":                "Other sensors",
      "mobo.other_title":          "Other Sensors",

      // Net
      "net.interfaces":            "Interfaces",
      "net.iface_count_one":       "{n} interface",
      "net.iface_count_other":     "{n} interfaces",

      // Detail views
      "detail.cpu.global":         "Global Usage",
      "detail.cpu.temperature":    "Temperature",
      "detail.cpu.frequency":      "Frequency",
      "detail.cpu.usage_core":     "Usage per core",
      "detail.cpu.sensors":        "CPU sensors",
      "detail.ram.percent":        "Percentage",
      "detail.ram.swap_used":      "Swap Used",
      "detail.ram.swap_total":     "Swap Total",
      "detail.gpu.clocks":         "Clocks & Limits",
      "detail.gpu.clock_gpu":      "GPU Clock",
      "detail.gpu.clock_mem":      "MEM Clock",
      "detail.gpu.power_limit":    "Power Limit",
      "detail.gpu.sensors":        "GPU sensors",

      // common
      "common.nodata":             "No data",
      "common.nd":                 "N/A",

      // About
      "about.title":               "About",
      "about.tagline":             "Real-time hardware monitoring",
      "about.developed_by_html":   "Developed by <a href=\"https://www.atomicode.net\" target=\"_blank\" class=\"footer-link\">Atomicode®</a>",
      "about.license.title":       "License",
      "about.license.body1_html":  "Monitor Xpress is free software distributed under the <strong>Mozilla Public License 2.0 (MPL-2.0)</strong>.",
      "about.license.body2":       "Its source code is open and may be used, modified and redistributed under the terms of that license. This project is non-profit.",
      "about.license.read":        "Read full license (MPL-2.0)",
      "about.privacy.title":       "Privacy policy",
      "about.privacy.body1_html":  "<strong>Monitor Xpress does NOT collect, transmit or store personal data.</strong>",
      "about.privacy.body2":       "All hardware information is processed exclusively and locally on your machine. No data is sent to external servers. No cookies, trackers or analytics tools are used.",
      "about.privacy.body3":       "Real-time metrics are kept in memory during execution and discarded when the application is closed. Interface preferences (theme, language, view mode) are saved locally on your device.",
      "about.privacy.body4":       "Administrator permission is required exclusively to read hardware sensors via LibreHardwareMonitor. It is not used for any other purpose.",
      "about.legal.title":         "Legal notice",
      "about.legal.body_html":     "This software is provided <strong>\"as is\"</strong>, without warranty of any kind, express or implied. Atomicode® shall not be liable for any direct, indirect, incidental or consequential damages arising from the use of this software.",
      "about.credits.title":       "Credits",
      "about.credits.component":   "Component",
      "about.credits.license":     "License",
      "about.credits.use":         "Use",
      "about.credits.use_lhm":     "Hardware sensor reading",
      "about.credits.use_tauri":   "Desktop application framework",
      "about.credits.use_chart":   "Real-time charts",
      "about.credits.use_sysinfo": "CPU, RAM, disk and network info",
      "about.credits.use_nvml":    "NVIDIA GPU monitoring",
      "about.contact.title":       "Contact",
      "about.contact.email":       "Email:",
      "about.contact.web":         "Web:",

      // Footer
      "footer.project_by_html":    "A project by <a href=\"https://www.atomicode.net\" target=\"_blank\" class=\"footer-link\">Atomicode®</a>",
      "footer.sensors_by_html":    "Sensors via <a href=\"https://github.com/LibreHardwareMonitor/LibreHardwareMonitor\" target=\"_blank\" class=\"footer-link\">LibreHardwareMonitor</a>",

      // Widget modal
      "modal.widget.title":            "Floating Widget",
      "modal.widget.text1_html":       "This feature is in <strong>beta</strong> and may affect system performance or behave unexpectedly.",
      "modal.widget.text2":            "When enabled, a floating window with the main metrics will open and the Monitor Xpress main window will be hidden.",
      "modal.widget.text3":            "Do you want to continue?",
      "modal.widget.cancel":           "Decline",
      "modal.widget.accept":           "Accept",
      "modal.widget.error":            "Could not open the floating widget:",

      // Floating widget window
      "widget.app_title":          "MONITOR XPRESS",
      "widget.back_title":         "Back to app",
      "widget.close_title":        "Close widget",
      "widget.label.cpu":          "CPU",
      "widget.label.ram":          "RAM",
      "widget.label.gpu":          "GPU",
      "widget.label.temp":         "Temp",
      "widget.label.freq":         "Freq",
      "widget.label.used":         "Used",
      "widget.label.available":    "Available",
      "widget.label.consumption":  "Power",
    },
  };

  let currentLang = localStorage.getItem("mx-lang");
  if (!currentLang || !TRANSLATIONS[currentLang]) {
    const nav = (navigator.language || "es").slice(0, 2).toLowerCase();
    currentLang = TRANSLATIONS[nav] ? nav : "es";
  }

  const listeners = new Set();

  function interpolate(str, params) {
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => (k in params ? params[k] : `{${k}}`));
  }

  function t(key, params) {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.es;
    const fallback = TRANSLATIONS.es[key];
    const raw = dict[key] != null ? dict[key] : (fallback != null ? fallback : key);
    return interpolate(raw, params);
  }

  function getLang() { return currentLang; }
  function getLangs() { return LANGS; }

  function setLang(code) {
    if (!TRANSLATIONS[code] || code === currentLang) return;
    currentLang = code;
    localStorage.setItem("mx-lang", code);
    document.documentElement.setAttribute("lang", code);
    applyI18n();
    listeners.forEach((fn) => { try { fn(code); } catch (e) { console.error(e); } });
  }

  function onLangChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  function applyI18n(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    scope.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
    document.documentElement.setAttribute("lang", currentLang);
  }

  window.MXi18n = { t, setLang, getLang, getLangs, applyI18n, onLangChange, LANGS };
})();
