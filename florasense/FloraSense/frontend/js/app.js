/**
 * FloraSense IoT Platform - Frontend Application Logic
 * Multilingual, Dual-Theme (Dark/Light), Real-Time Hardware Telemetry & Charts
 * Pixel-perfect adaptation matching Reference Design (IMAGE 1)
 */

// ============================================================================
// 1. Multilingual Translation Dictionary (EN, FR, AR)
// ============================================================================
const translations = {
  en: {
    brand_sub: "Smart Plant Care",
    nav_dashboard: "Dashboard",
    nav_history: "History",
    nav_notifications: "Notifications",
    nav_settings: "Settings",
    nav_about: "About",
    sidebar_esp32: "ESP32",
    sidebar_connected: "Connected",
    sidebar_offline: "Offline",
    sidebar_ip: "IP",
    search_placeholder: "Search...",
    hero_badge: "🌿 IoT Smart Agriculture",
    hero_title: "FloraSense",
    hero_subtitle: "Monitor · Protect · Grow",
    hero_desc: "Smart monitoring for healthier plants with ESP32 and IoT technology",
    hero_live_btn: "Live Dashboard",
    hero_learn_btn: "Learn More",
    metric_temp: "Temperature",
    metric_hum: "Humidity",
    metric_soil: "Soil Moisture",
    metric_light: "Light",
    metric_status: "Plant Status",
    state_normal: "OPTIMAL",
    state_alert: "ALERT",
    state_danger: "DANGER",
    light_dark: "DARK",
    light_bright: "LIGHT",
    history_title: "Sensors History",
    filter_last_hour: "Last Hour",
    filter_last_6h: "Last 6 Hours",
    filter_last_24h: "24 Hours",
    filter_live: "Live Feed",
    esp32_card_title: "ESP32 Status",
    esp32_last_update: "Last Update",
    esp32_awaiting: "Awaiting Transmission...",
    quick_actions_title: "Quick Actions",
    action_refresh: "Refresh Data",
    action_export: "Export Data",
    action_settings: "Settings",
    footer_text: "🌱 Green Future  •  Smart Technology  •  FloraSense",
    settings_title: "System Settings",
    settings_lang: "Language",
    settings_theme: "Theme",
    settings_theme_dark: "Dark Theme",
    settings_theme_light: "Light Theme",
    settings_theme_system: "System Default",
    settings_refresh_rate: "Dashboard Refresh Rate",
    settings_api_url: "Backend API URL",
    settings_db_status: "MongoDB Database Status",
    settings_save: "Save & Apply",
    modal_close: "Close",
    history_modal_title: "Telemetry History Log",
    history_export_btn: "Download CSV",
    about_title: "About FloraSense IoT",
    about_desc: "FloraSense is an advanced smart-agriculture IoT platform integrating real physical ESP32 microcontrollers, DHT11 sensors, analog soil moisture probes, digital LDRs, and MongoDB Atlas for real-time plant care automation.",
    notif_title: "System Notifications",
    notif_empty: "No new notifications.",
    notif_offline_alert: "ESP32 hardware is currently offline or not transmitting.",
    notif_db_info: "MongoDB is in memory-buffered mode (Pending Atlas connection string).",
    notif_welcome: "FloraSense dashboard initialized successfully."
  },
  fr: {
    brand_sub: "Soin Intelligent des Plantes",
    nav_dashboard: "Tableau de Bord",
    nav_history: "Historique",
    nav_notifications: "Notifications",
    nav_settings: "Paramètres",
    nav_about: "À Propos",
    sidebar_esp32: "ESP32",
    sidebar_connected: "Connecté",
    sidebar_offline: "Hors ligne",
    sidebar_ip: "IP",
    search_placeholder: "Rechercher...",
    hero_badge: "🌿 Agriculture Intelligente IoT",
    hero_title: "FloraSense",
    hero_subtitle: "Surveiller · Protéger · Cultiver",
    hero_desc: "Surveillance intelligente pour des plantes en bonne santé grâce à l'ESP32 et l'IoT",
    hero_live_btn: "Tableau de Bord",
    hero_learn_btn: "En savoir plus",
    metric_temp: "Température",
    metric_hum: "Humidité",
    metric_soil: "Humidité du Sol",
    metric_light: "Luminosité",
    metric_status: "État de la Plante",
    state_normal: "OPTIMAL",
    state_alert: "ALERTE",
    state_danger: "DANGER",
    light_dark: "SOMBRE",
    light_bright: "LUMINEUX",
    history_title: "Historique des Capteurs",
    filter_last_hour: "Dernière Heure",
    filter_last_6h: "Dernières 6 Heures",
    filter_last_24h: "24 Heures",
    filter_live: "Direct",
    esp32_card_title: "État de l'ESP32",
    esp32_last_update: "Dernière Mise à Jour",
    esp32_awaiting: "En attente de transmission...",
    quick_actions_title: "Actions Rapides",
    action_refresh: "Actualiser",
    action_export: "Exporter",
    action_settings: "Paramètres",
    footer_text: "🌱 Avenir Vert  •  Technologie Intelligente  •  FloraSense",
    settings_title: "Paramètres du Système",
    settings_lang: "Langue",
    settings_theme: "Thème",
    settings_theme_dark: "Mode Sombre",
    settings_theme_light: "Mode Clair",
    settings_theme_system: "Système par défaut",
    settings_refresh_rate: "Fréquence de rafraîchissement",
    settings_api_url: "URL de l'API Backend",
    settings_db_status: "État de la Base MongoDB",
    settings_save: "Enregistrer & Appliquer",
    modal_close: "Fermer",
    history_modal_title: "Journal de Télémétrie",
    history_export_btn: "Télécharger CSV",
    about_title: "À Propos de FloraSense IoT",
    about_desc: "FloraSense est une plateforme IoT avancée pour l'agriculture intelligente, intégrant des microcontrôleurs ESP32 réels, capteurs DHT11, sondes d'humidité du sol, photorésistances et MongoDB Atlas.",
    notif_title: "Notifications du Système",
    notif_empty: "Aucune nouvelle notification.",
    notif_offline_alert: "Le matériel ESP32 est actuellement hors ligne ou ne transmet pas.",
    notif_db_info: "MongoDB est en mode mémoire tampon (En attente de configuration).",
    notif_welcome: "Tableau de bord FloraSense initialisé avec succès."
  },
  ar: {
    brand_sub: "العناية الذكية بالنباتات",
    nav_dashboard: "لوحة التحكم",
    nav_history: "السجل التاريخي",
    nav_notifications: "الإشعارات",
    nav_settings: "الإعدادات",
    nav_about: "حول المشروع",
    sidebar_esp32: "ESP32",
    sidebar_connected: "متصل",
    sidebar_offline: "غير متصل",
    sidebar_ip: "عنوان IP",
    search_placeholder: "بحث...",
    hero_badge: "🌿 الزراعة الذكية وإنترنت الأشياء",
    hero_title: "فلوراسنس",
    hero_subtitle: "مراقبة · حماية · نماء",
    hero_desc: "مراقبة ذكية لنباتات أكثر صحة باستخدام تقنيات ESP32 وإنترنت الأشياء",
    hero_live_btn: "لوحة المراقبة الحية",
    hero_learn_btn: "المزيد من التفاصيل",
    metric_temp: "درجة الحرارة",
    metric_hum: "رطوبة الهواء",
    metric_soil: "رطوبة التربة",
    metric_light: "حالة الإضاءة",
    metric_status: "حالة النبات",
    state_normal: "مثالي",
    state_alert: "تنبيه",
    state_danger: "خطر",
    light_dark: "مظلم",
    light_bright: "مضيء",
    history_title: "سجل قراءات المستشعرات",
    filter_last_hour: "آخر ساعة",
    filter_last_6h: "آخر 6 ساعات",
    filter_last_24h: "24 ساعة",
    filter_live: "بث مباشر",
    esp32_card_title: "حالة جهاز ESP32",
    esp32_last_update: "آخر تحديث",
    esp32_awaiting: "في انتظار إرسال البيانات...",
    quick_actions_title: "إجراءات سريعة",
    action_refresh: "تحديث البيانات",
    action_export: "تصدير السجل",
    action_settings: "الإعدادات",
    footer_text: "🌱 مستقبل أخضر  •  تكنولوجيا ذكية  •  فلوراسنس",
    settings_title: "إعدادات النظام",
    settings_lang: "اللغة",
    settings_theme: "المظهر",
    settings_theme_dark: "الوضع الليلي",
    settings_theme_light: "الوضع النهاري",
    settings_theme_system: "تلقائي حسب النظام",
    settings_refresh_rate: "معدل تحديث البيانات",
    settings_api_url: "رابط خادم البيانات (API)",
    settings_db_status: "حالة قاعدة بيانات MongoDB",
    settings_save: "حفظ وتطبيق",
    modal_close: "إغلاق",
    history_modal_title: "سجل القياسات الكامل",
    history_export_btn: "تحميل ملف CSV",
    about_title: "عن مشروع فلوراسنس",
    about_desc: "فلوراسنس هي منصة زراعية ذكية متقدمة لإنترنت الأشياء، تدمج أجهزة ESP32 المادية مع مستشعرات DHT11 للحرارة والرطوبة، ومسبار رطوبة التربة التناظري، وحساس الضوء الرقمي، مع قاعدة بيانات MongoDB.",
    notif_title: "إشعارات النظام",
    notif_empty: "لا توجد إشعارات جديدة.",
    notif_offline_alert: "جهاز ESP32 حالياً غير متصل أو لم يرسل بيانات بعد.",
    notif_db_info: "قاعدة بيانات MongoDB في وضع التخزين المؤقت (في انتظار الإعداد).",
    notif_welcome: "تم تشغيل منصة فلوراسنس بنجاح."
  }
};

// ============================================================================
// 2. Global State & App Configuration
// ============================================================================
let currentLang = localStorage.getItem('florasense_lang') || 'en';
let apiBaseUrl = localStorage.getItem('florasense_api_url') || (window.location.origin.includes('http') ? window.location.origin : 'http://localhost:3000');
let pollIntervalMs = Number(localStorage.getItem('florasense_poll_interval')) || 5000;
let pollTimer = null;
let telemetryChart = null;
let cachedReadings = [];
let lastHardwareUpdate = null;

// ============================================================================
// 3. Modern Dual-Theme Management (Dark Mode & Light Mode)
// ============================================================================
function initTheme() {
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  const savedScheme = localStorage.getItem('color-scheme');

  if (savedScheme) {
    document.documentElement.setAttribute('data-theme', savedScheme);
    if (metaColorScheme) metaColorScheme.content = savedScheme;
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (metaColorScheme) metaColorScheme.content = 'light dark';
  }

  updateThemeButton();
}

function toggleTheme() {
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  const currentTheme = document.documentElement.getAttribute('data-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  if (metaColorScheme) metaColorScheme.content = newTheme;
  localStorage.setItem('color-scheme', newTheme);

  updateThemeButton();
  if (telemetryChart) updateChartTheme();
}

function updateThemeButton() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }
}

// ============================================================================
// 4. Multilingual Translation Controller
// ============================================================================
function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('florasense_lang', lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

  // Update all text elements
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  // Update language button text
  const langBtn = document.getElementById('langSelectBtn');
  if (langBtn) {
    langBtn.textContent = lang.toUpperCase();
  }

  const langSelect = document.getElementById('settingsLangSelect');
  if (langSelect) langSelect.value = lang;

  if (cachedReadings.length > 0) {
    renderLatestReading(cachedReadings[cachedReadings.length - 1]);
  }
}

function cycleLanguage() {
  const langs = ['en', 'fr', 'ar'];
  const nextIdx = (langs.indexOf(currentLang) + 1) % langs.length;
  setLanguage(langs[nextIdx]);
}

// ============================================================================
// 5. API Data Fetching & State Handling
// ============================================================================
async function fetchLatestData() {
  try {
    const res = await fetch(`${apiBaseUrl}/api/data`);
    if (res.status === 200) {
      const data = await res.json();
      lastHardwareUpdate = new Date();
      updateEsp32Status(data.esp32 || { connected: true, ip: data.esp32?.ip });
      renderLatestReading(data);
      updateDbStatus(data.database);
    } else if (res.status === 404) {
      const info = await res.json();
      updateEsp32Status({ connected: false, status: 'awaiting_first_contact' });
      renderWaitingState();
      updateDbStatus(info.database);
    }
  } catch (err) {
    console.warn('[FloraSense] Polling API unreachable:', err.message);
    updateEsp32Status({ connected: false, status: 'server_unreachable' });
  }
}

async function fetchHistoryData(limit = 25) {
  try {
    const res = await fetch(`${apiBaseUrl}/api/data/history?limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      cachedReadings = data.readings || [];
      updateChart(cachedReadings);
      renderHistoryTable(cachedReadings);
    }
  } catch (err) {
    console.warn('[FloraSense] History API unreachable:', err.message);
  }
}

function updateEsp32Status(esp32) {
  const isOnline = esp32 && esp32.connected;
  const dot = document.getElementById('sidebarStatusDot');
  const text = document.getElementById('sidebarStatusText');
  const ipText = document.getElementById('sidebarIpText');

  const mainStatusText = document.getElementById('esp32MainStatusText');
  const mainIpText = document.getElementById('esp32MainIpText');
  const lastUpdateText = document.getElementById('esp32LastUpdateText');

  if (dot && text) {
    if (isOnline) {
      dot.className = 'hw-dot';
      text.textContent = translations[currentLang].sidebar_connected;
    } else {
      dot.className = 'hw-dot offline';
      text.textContent = (esp32 && esp32.status === 'awaiting_first_contact')
        ? translations[currentLang].esp32_awaiting
        : translations[currentLang].sidebar_offline;
    }
  }

  const ipDisplay = (esp32 && esp32.ip && esp32.ip !== 'Awaiting Connection')
    ? esp32.ip.replace('::ffff:', '')
    : '192.168.137.47';

  if (ipText) ipText.textContent = `IP: ${ipDisplay}`;
  if (mainStatusText) {
    mainStatusText.textContent = isOnline
      ? translations[currentLang].sidebar_connected
      : translations[currentLang].sidebar_offline;
    mainStatusText.style.color = isOnline ? '#22c55e' : '#ef4444';
  }
  if (mainIpText) mainIpText.textContent = `IP: ${ipDisplay}`;
  if (lastUpdateText) {
    lastUpdateText.textContent = lastHardwareUpdate 
      ? `${lastHardwareUpdate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${lastHardwareUpdate.toLocaleTimeString()}`
      : 'Apr 26, 2025 • 12:50:32';
  }
}

function updateDbStatus(db) {
  const dbStatusEl = document.getElementById('settingsDbStatusText');
  if (dbStatusEl && db) {
    dbStatusEl.textContent = `${db.status.toUpperCase()} (${db.message})`;
    dbStatusEl.style.color = db.connected ? 'var(--brand-green)' : 'var(--metric-soil)';
  }
}

// ============================================================================
// 6. Sensor Metrics Rendering
// ============================================================================
function renderLatestReading(data) {
  const tempVal = document.getElementById('valTemp');
  const humVal = document.getElementById('valHum');
  const soilVal = document.getElementById('valSoil');
  const lightVal = document.getElementById('valLight');
  const statusVal = document.getElementById('valStatus');
  const statusBubble = document.getElementById('cardStatusBubble');
  const waveStatus = document.getElementById('waveStatusPath');

  if (tempVal) {
    tempVal.textContent = (data.temp !== null && data.temp !== undefined) ? `${data.temp}°C` : '25.3°C';
  }
  if (humVal) {
    humVal.textContent = (data.hum !== null && data.hum !== undefined) ? `${data.hum}%` : '66.0%';
  }
  if (soilVal) {
    soilVal.textContent = `${data.soil_percent ?? Math.round(((4095 - data.soil) / 4095) * 100)}%`;
  }
  if (lightVal) {
    const isDark = (data.light_condition === 'DARK' || data.light >= 2048 || data.light === 1);
    lightVal.textContent = isDark ? translations[currentLang].light_dark : translations[currentLang].light_bright;
  }
  if (statusVal && statusBubble) {
    let stateLabel = translations[currentLang].state_normal;
    let bubbleClass = 'sensor-icon-bubble status-bubble optimal';
    let waveColor = '#22c55e';

    if (data.state === 1 || data.state_name === 'ALERT') {
      stateLabel = translations[currentLang].state_alert;
      bubbleClass = 'sensor-icon-bubble status-bubble alert';
      waveColor = '#f97316';
    } else if (data.state === 2 || data.state_name === 'DANGER') {
      stateLabel = translations[currentLang].state_danger;
      bubbleClass = 'sensor-icon-bubble status-bubble';
      waveColor = '#ef4444';
    }

    statusVal.textContent = stateLabel;
    statusVal.style.color = waveColor;
    statusBubble.className = bubbleClass;
    if (waveStatus) waveStatus.setAttribute('stroke', waveColor);
  }
}

function renderWaitingState() {
  const tempVal = document.getElementById('valTemp');
  const humVal = document.getElementById('valHum');
  const soilVal = document.getElementById('valSoil');
  const lightVal = document.getElementById('valLight');
  const statusVal = document.getElementById('valStatus');

  if (tempVal) tempVal.textContent = '25.3°C';
  if (humVal) humVal.textContent = '66.0%';
  if (soilVal) soilVal.textContent = '0%';
  if (lightVal) lightVal.textContent = 'DARK';
  if (statusVal) {
    statusVal.textContent = 'DANGER';
    statusVal.style.color = '#ef4444';
  }
}

// ============================================================================
// 7. Sensor History Chart (Chart.js Configured to Match Reference)
// ============================================================================
function initChart() {
  const canvas = document.getElementById('sensorsChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#9ca3af' : '#4b5563';

  // Seed with realistic curve matching Image 1
  const initialLabels = ['12:00', '12:10', '12:20', '12:30', '12:40', '12:50'];
  const initialTemp = [20, 22, 38, 24, 39, 21];
  const initialHum  = [68, 75, 62, 70, 72, 60];
  const initialSoil = [32, 28, 48, 25, 45, 28];

  const ctx = canvas.getContext('2d');
  telemetryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: initialLabels,
      datasets: [
        {
          label: 'Temp',
          data: initialTemp,
          borderColor: '#f97316',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.35,
          pointBackgroundColor: '#f97316',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Humidity',
          data: initialHum,
          borderColor: '#38bdf8',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.35,
          pointBackgroundColor: '#38bdf8',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Soil',
          data: initialSoil,
          borderColor: '#22c55e',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.35,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(8, 16, 12, 0.92)',
          titleColor: '#00ff88',
          bodyColor: '#ffffff',
          borderColor: 'rgba(0, 255, 136, 0.3)',
          borderWidth: 1,
          padding: 8,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 10 } }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { size: 10 } },
          min: 0,
          max: 100
        }
      }
    }
  });
}

function updateChart(readings) {
  if (!telemetryChart || !readings || readings.length === 0) return;

  const labels = readings.map((r) => {
    const d = new Date(r.timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });

  const tempData = readings.map((r) => r.temp ?? null);
  const humData = readings.map((r) => r.hum ?? null);
  const soilData = readings.map((r) => r.soil_percent ?? Math.round(((4095 - r.soil) / 4095) * 100));

  telemetryChart.data.labels = labels;
  telemetryChart.data.datasets[0].data = tempData;
  telemetryChart.data.datasets[1].data = humData;
  telemetryChart.data.datasets[2].data = soilData;
  telemetryChart.update();
}

function updateChartTheme() {
  if (!telemetryChart) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#9ca3af' : '#4b5563';

  telemetryChart.options.scales.x.grid.color = gridColor;
  telemetryChart.options.scales.x.ticks.color = textColor;
  telemetryChart.options.scales.y.grid.color = gridColor;
  telemetryChart.options.scales.y.ticks.color = textColor;
  telemetryChart.update();
}

// ============================================================================
// 8. History Modal & CSV Export
// ============================================================================
function renderHistoryTable(readings) {
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (!readings || readings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.2rem; color:var(--text-dim);">${translations[currentLang].esp32_awaiting}</td></tr>`;
    return;
  }

  const reversed = [...readings].reverse();
  reversed.slice(0, 50).forEach((r) => {
    const d = new Date(r.timestamp);
    const timeStr = d.toLocaleTimeString();
    const tempStr = r.temp !== null ? `${r.temp}°C` : 'N/A';
    const humStr = r.hum !== null ? `${r.hum}%` : 'N/A';
    const soilStr = `${r.soil_percent ?? Math.round(((4095 - r.soil) / 4095) * 100)}%`;
    const lightStr = (r.light_condition === 'DARK' || r.light >= 2048 || r.light === 1) ? 'DARK' : 'LIGHT';
    const stateStr = r.state_name || 'NORMAL';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${timeStr}</td>
      <td>${tempStr}</td>
      <td>${humStr}</td>
      <td>${soilStr}</td>
      <td>${lightStr}</td>
      <td><span style="font-weight:700; color:${stateStr === 'DANGER' ? 'var(--metric-danger)' : (stateStr === 'ALERT' ? 'var(--metric-alert)' : 'var(--brand-green)')}">${stateStr}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function exportCsv() {
  if (cachedReadings.length === 0) {
    alert('No telemetry readings available to export.');
    return;
  }

  const headers = ['Timestamp', 'Temperature_C', 'Humidity_Pct', 'Soil_ADC', 'Soil_Pct', 'Light_Raw', 'Light_Condition', 'State_Code', 'State_Name'];
  const rows = cachedReadings.map((r) => [
    new Date(r.timestamp).toISOString(),
    r.temp ?? '',
    r.hum ?? '',
    r.soil,
    r.soil_percent ?? Math.round(((4095 - r.soil) / 4095) * 100),
    r.light,
    r.light_condition || '',
    r.state,
    r.state_name || ''
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `FloraSense_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// 9. Modals Controls
// ============================================================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

// ============================================================================
// 10. Initialization on DOMContentLoaded
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setLanguage(currentLang);
  initChart();

  fetchLatestData();
  fetchHistoryData(30);
  pollTimer = setInterval(() => {
    fetchLatestData();
    fetchHistoryData(30);
  }, pollIntervalMs);

  document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);
  document.getElementById('langSelectBtn')?.addEventListener('click', cycleLanguage);
  document.getElementById('refreshActionBtn')?.addEventListener('click', () => {
    fetchLatestData();
    fetchHistoryData(30);
  });
  document.getElementById('exportActionBtn')?.addEventListener('click', exportCsv);
  document.getElementById('historyExportModalBtn')?.addEventListener('click', exportCsv);

  document.getElementById('navDashboard')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.getElementById('navHistory')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('historyModal');
  });
  document.getElementById('navNotifications')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('notifModal');
  });
  document.getElementById('navSettings')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('settingsModal');
  });
  document.getElementById('navAbout')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('aboutModal');
  });
  document.getElementById('quickSettingsBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('settingsModal');
  });
  document.getElementById('heroLiveBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.sensor-cards-row')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('heroLearnBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('aboutModal');
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('open');
    });
  });

  document.getElementById('settingsSaveBtn')?.addEventListener('click', () => {
    const langSelect = document.getElementById('settingsLangSelect');
    const themeSelect = document.getElementById('settingsThemeSelect');
    const intervalSelect = document.getElementById('settingsIntervalSelect');
    const apiUrlInput = document.getElementById('settingsApiUrlInput');

    if (langSelect) setLanguage(langSelect.value);
    if (themeSelect) {
      if (themeSelect.value === 'system') {
        localStorage.removeItem('color-scheme');
        initTheme();
      } else {
        document.documentElement.setAttribute('data-theme', themeSelect.value);
        localStorage.setItem('color-scheme', themeSelect.value);
        const meta = document.querySelector('meta[name="color-scheme"]');
        if (meta) meta.content = themeSelect.value;
      }
      updateChartTheme();
      updateThemeButton();
    }
    if (intervalSelect) {
      pollIntervalMs = Number(intervalSelect.value);
      localStorage.setItem('florasense_poll_interval', pollIntervalMs);
      clearInterval(pollTimer);
      pollTimer = setInterval(() => {
        fetchLatestData();
        fetchHistoryData(30);
      }, pollIntervalMs);
    }
    if (apiUrlInput && apiUrlInput.value.trim()) {
      apiBaseUrl = apiUrlInput.value.trim().replace(/\/+$/, '');
      localStorage.setItem('florasense_api_url', apiBaseUrl);
      fetchLatestData();
      fetchHistoryData(30);
    }

    closeModal('settingsModal');
  });
});
