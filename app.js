// app.js — dark-only + raw light + English date

class GreenhouseApp {
  constructor() {
    this.alerts = [];
    this.lastReading = null;
    this.connectionStatus = false;

    // ثبّت اللغة المفضلة للواجهة لكن التاريخ إنجليزي
    this.currentLang = localStorage.getItem("greenhouse-lang") || "ar";

    // ثبّت الدارك مود نهائياً
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.className = "dark-mode";

    this.dailyStats = { maxTemp: null, minTemp: null, avgHumidity: null, totalLight: 0, readingCount: 0 };
    this._connTimeout = null;

    this.initializeApp();
  }

  async initializeApp() {
    await this.waitForFirebase();
    this.loadPreferences();
    this.initializeControls();
    this.startRealTimeUpdates();
    this.loadInitialData();
  }

  waitForFirebase() {
    return new Promise((resolve) => {
      const chk = () => (window.FirebaseHelper ? resolve() : setTimeout(chk, 100));
      chk();
    });
  }

  initializeControls() {
    // لا يوجد themeToggle بعد الآن
    const langToggle = document.getElementById("langToggle");
    langToggle && langToggle.addEventListener("click", () => this.toggleLanguage());
  }

  loadPreferences() {
    this.setLanguage(this.currentLang);
  }

  toggleLanguage() {
    this.setLanguage(this.currentLang === "ar" ? "en" : "ar");
  }
  setLanguage(lang) {
    this.currentLang = lang;
    document.documentElement.lang = lang;
    document.body.dir = lang === "ar" ? "rtl" : "ltr";
    const langText = document.querySelector(".lang-text");
    if (langText) langText.textContent = lang === "ar" ? "EN" : "ع";
    this.updateLanguageTexts();
    localStorage.setItem("greenhouse-lang", lang);
  }
  updateLanguageTexts() {
    document.querySelectorAll("[data-ar][data-en]").forEach((el) => {
      const t = el.getAttribute(`data-${this.currentLang}`);
      if (t) el.textContent = t;
    });
  }

  // ------- REALTIME -------
  startRealTimeUpdates() {
    try {
      window.FirebaseHelper.getLatestReading((latest) => {
        if (!latest) return;
        this.updateUI(latest);
        this.lastReading = latest;
        this._setOnline();
      });

      window.FirebaseHelper.watchRealTimeUpdates((reading) => {
        if (!reading) return;
        this.checkAlerts(reading);
        this.updateStatistics(reading);
        this.updateTrends(reading);
        this.lastReading = reading;
        this._setOnline();
      });

      this._armConnectionWatchdog();
    } catch (e) {
      console.error("Realtime error:", e);
      this._setOffline();
    }
  }

  _armConnectionWatchdog() {
    clearTimeout(this._connTimeout);
    this._connTimeout = setTimeout(() => this._setOffline(), 20000);
  }
  _setOnline() {
    this.connectionStatus = true;
    this.updateConnectionStatus();
    this._armConnectionWatchdog();
  }
  _setOffline() {
    this.connectionStatus = false;
    this.updateConnectionStatus();
  }

  loadInitialData() {
    try {
      window.FirebaseHelper.getLastHour((obj) => {
        const readings = Object.values(obj || {});
        if (readings.length) this.calculateDailyStats(readings);
      });
    } catch (e) {
      console.error("Initial load error:", e);
    }
  }

  // ---------- UI ----------
  updateUI(reading) {
    this.updateElement("temperature", this._fmtNum(reading.temperature, 1, "--"));
    this.updateElement("humidity", this._fmtNum(reading.humidity, 1, "--"));
    this.updateElement("soilMoisture", this._fmtNum(reading.soil_moisture, 1, "--"));

    // الإضاءة: استخدم القيمة كما هي (لا تضرب ×1000)
    const luxValue = (reading.light_intensity ?? null) !== null ? Math.round(reading.light_intensity) : "--";
    this.updateElement("lightIntensity", luxValue);

    // الماء: ابقي التحويل كما هو (نسبة → سم) إن كان يناسبك
    const waterCm = (reading.water_level ?? null) !== null ? (reading.water_level * 0.5).toFixed(1) : "--";
    this.updateElement("waterLevel", waterCm);

    // التاريخ: دائماً Gregorian/English
    const ts = new Date(reading.timestamp || Date.now()).toLocaleString("en-US");
    this.updateElement("lastUpdate", ts);

    this.updateStatusIndicators(reading);
    this.updateEnvironmentIndicators(reading);
  }

  _fmtNum(v, d = 1, fallback = "--") {
    return (v ?? null) === null ? fallback : Number(v).toFixed(d);
  }

  updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  updateStatusIndicators(reading) {
    const msg = {
      ar: {
        temp: { cold: "بارد جداً", hot: "حار جداً", ideal: "مثالي", acceptable: "مقبول" },
        humidity: { dry: "جاف", wet: "رطب جداً", ideal: "مثالي" },
        soil: { dry: "تحتاج ري", wet: "مشبعة بالماء", good: "رطوبة جيدة" },
        light: { low: "إضاءة ضعيفة", high: "إضاءة قوية", good: "إضاءة مناسبة" },
        water: { low: "مستوى منخفض", medium: "يحتاج تعبئة", good: "مستوى جيد" },
        updated: "تم التحديث",
      },
      en: {
        temp: { cold: "Too Cold", hot: "Too Hot", ideal: "Ideal", acceptable: "Acceptable" },
        humidity: { dry: "Too Dry", wet: "Too Humid", ideal: "Ideal" },
        soil: { dry: "Needs Water", wet: "Over Watered", good: "Good Moisture" },
        light: { low: "Low Light", high: "High Light", good: "Good Light" },
        water: { low: "Low Level", medium: "Needs Refill", good: "Good Level" },
        updated: "Updated",
      },
    }[this.currentLang];

    // ملاحظة: عتبات الإضاءة الحالية مبنية على نسب. لو كانت قيمك Lux حقيقية غيّر العتبات لاحقاً.
    this.updateStatus("tempStatus", reading.temperature, msg.temp, [15, 35, 20, 30]);
    this.updateStatus("humidityStatus", reading.humidity, msg.humidity, [30, 80]);
    this.updateStatus("soilStatus", reading.soil_moisture, msg.soil, [30, 80]);
    this.updateStatus("lightStatus", reading.light_intensity, msg.light, [20, 90]);
    this.updateStatus("waterStatus", reading.water_level, msg.water, [20, 50]);

    this.updateElement("updateStatus", msg.updated);
  }

  updateStatus(elementId, value, messages, thresholds) {
    const el = document.getElementById(elementId);
    if (!el || value === undefined) return;

    let status, cls;
    if (elementId === "tempStatus") {
      if (value < thresholds[0]) { status = messages.cold; cls = "card-status danger"; }
      else if (value > thresholds[1]) { status = messages.hot; cls = "card-status danger"; }
      else if (value >= thresholds[2] && value <= thresholds[3]) { status = messages.ideal; cls = "card-status good"; }
      else { status = messages.acceptable; cls = "card-status warning"; }
    } else {
      if (value < thresholds[0]) { status = Object.values(messages)[0]; cls = "card-status danger"; }
      else if (value > thresholds[1]) { status = Object.values(messages)[1]; cls = "card-status warning"; }
      else { status = Object.values(messages)[2] || Object.values(messages)[1]; cls = "card-status good"; }
    }
    el.textContent = status;
    el.className = cls;
  }

  updateConnectionStatus() {
    const el = document.getElementById("connectionStatus");
    if (!el) return;
    const dot = el.querySelector(".status-dot");
    const txt = el.querySelector("span:last-child");
    if (!dot || !txt) return;

    if (this.connectionStatus) {
      dot.className = "status-dot online";
      txt.textContent = this.currentLang === "ar" ? "متصل" : "Online";
    } else {
      dot.className = "status-dot offline";
      txt.textContent = this.currentLang === "ar" ? "غير متصل" : "Offline";
    }
  }

  checkAlerts(reading) {
    const alerts = [];
    const ar = this.currentLang === "ar";

    if (reading.temperature < 15) {
      alerts.push({ type: "danger", message: ar ? `<i class="fas fa-exclamation-triangle"></i> تحذير: درجة الحرارة منخفضة جداً (${reading.temperature.toFixed(1)}°C)` : `<i class="fas fa-exclamation-triangle"></i> Warning: Temperature too low (${reading.temperature.toFixed(1)}°C)` });
    } else if (reading.temperature > 35) {
      alerts.push({ type: "danger", message: ar ? `<i class="fas fa-fire"></i> تحذير: درجة الحرارة مرتفعة جداً (${reading.temperature.toFixed(1)}°C)` : `<i class="fas fa-fire"></i> Warning: Temperature too high (${reading.temperature.toFixed(1)}°C)` });
    }
    if (reading.soil_moisture < 30) {
      alerts.push({ type: "warning", message: ar ? `<i class="fas fa-seedling"></i> تنبيه: التربة تحتاج للري (${reading.soil_moisture.toFixed(1)}%)` : `<i class="fas fa-seedling"></i> Alert: Soil needs watering (${reading.soil_moisture.toFixed(1)}%)` });
    }
    if (reading.water_level < 20) {
      alerts.push({ type: "danger", message: ar ? `<i class="fas fa-faucet"></i> تحذير: مستوى الماء منخفض جداً (${reading.water_level.toFixed(1)}%)` : `<i class="fas fa-faucet"></i> Warning: Water level very low (${reading.water_level.toFixed(1)}%)` });
    }

    this.updateAlertsUI(alerts);
  }

  updateAlertsUI(alerts) {
    const box = document.getElementById("alertsContainer");
    if (!box) return;
    if (!alerts.length) {
      const t = this.currentLang === "ar" ? "لا توجد تنبيهات حالياً" : "No alerts currently";
      box.innerHTML = `<div class="no-alerts"><i class="fas fa-check-circle"></i> ${t}</div>`;
      return;
    }
    box.innerHTML = alerts.map(a => `<div class="alert ${a.type}">${a.message}</div>`).join("");
  }

  updateStatistics(reading) {
    if (!reading) return;
    if (reading.temperature !== undefined) {
      if (this.dailyStats.maxTemp === null || reading.temperature > this.dailyStats.maxTemp) {
        this.dailyStats.maxTemp = reading.temperature;
        this.updateElement("maxTemp", reading.temperature.toFixed(1) + "°C");
      }
      if (this.dailyStats.minTemp === null || reading.temperature < this.dailyStats.minTemp) {
        this.dailyStats.minTemp = reading.temperature;
        this.updateElement("minTemp", reading.temperature.toFixed(1) + "°C");
      }
    }
    if (reading.humidity !== undefined) {
      this.dailyStats.readingCount++;
      const cur = this.dailyStats.avgHumidity || 0;
      this.dailyStats.avgHumidity = (cur * (this.dailyStats.readingCount - 1) + reading.humidity) / this.dailyStats.readingCount;
      this.updateElement("avgHumidity", this.dailyStats.avgHumidity.toFixed(1) + "%");
    }
    if (reading.light_intensity !== undefined) {
      // نجمع القيمة كما هي بدون ×1000
      this.dailyStats.totalLight += Number(reading.light_intensity) || 0;
      this.updateElement("totalLight", Math.round(this.dailyStats.totalLight) + " Lux");
    }
  }

  calculateDailyStats(readings) {
    if (!readings?.length) return;
    let humiditySum = 0, lightSum = 0;
    let maxTemp = -Infinity, minTemp = Infinity;

    readings.forEach((r) => {
      if (r.temperature !== undefined) {
        maxTemp = Math.max(maxTemp, r.temperature);
        minTemp = Math.min(minTemp, r.temperature);
      }
      if (r.humidity !== undefined) humiditySum += r.humidity;
      if (r.light_intensity !== undefined) lightSum += Number(r.light_intensity) || 0;
    });

    this.dailyStats.maxTemp = maxTemp > -Infinity ? maxTemp : null;
    this.dailyStats.minTemp = minTemp < Infinity ? minTemp : null;
    this.dailyStats.avgHumidity = humiditySum / readings.length;
    this.dailyStats.totalLight = lightSum;
    this.dailyStats.readingCount = readings.length;

    this.updateElement("maxTemp", this.dailyStats.maxTemp ? this.dailyStats.maxTemp.toFixed(1) + "°C" : "--");
    this.updateElement("minTemp", this.dailyStats.minTemp ? this.dailyStats.minTemp.toFixed(1) + "°C" : "--");
    this.updateElement("avgHumidity", this.dailyStats.avgHumidity ? this.dailyStats.avgHumidity.toFixed(1) + "%" : "--");
    this.updateElement("totalLight", Math.round(this.dailyStats.totalLight) + " Lux");
  }

  updateTrends(reading) {
    if (!this.lastReading || !reading) return;
    const tr = (oldV, newV) => {
      if (oldV === undefined || newV === undefined) return "stable";
      const diff = newV - oldV;
      const th = Math.max(0.01, Math.abs(oldV) * 0.05);
      if (Math.abs(diff) < th) return "stable";
      return diff > 0 ? "up" : "down";
    };
    this.updateTrendUI("tempTrend", tr(this.lastReading.temperature, reading.temperature));
    this.updateTrendUI("humidityTrend", tr(this.lastReading.humidity, reading.humidity));
    this.updateTrendUI("soilTrend", tr(this.lastReading.soil_moisture, reading.soil_moisture));
    this.updateTrendUI("lightTrend", tr(this.lastReading.light_intensity, reading.light_intensity));
    this.updateTrendUI("waterTrend", tr(this.lastReading.water_level, reading.water_level));
  }

  updateTrendUI(id, trend) {
    const el = document.getElementById(id);
    if (!el) return;
    const icon = el.querySelector(".trend-icon");
    const text = el.querySelector("span");
    if (!icon || !text) return;

    const ar = this.currentLang === "ar";
    el.className = `card-trend ${trend}`;
    if (trend === "up") { icon.className = "fas fa-arrow-up trend-icon"; text.textContent = ar ? "في ارتفاع" : "Rising"; }
    else if (trend === "down") { icon.className = "fas fa-arrow-down trend-icon"; text.textContent = ar ? "في انخفاض" : "Falling"; }
    else { icon.className = "fas fa-minus trend-icon"; text.textContent = ar ? "مستقر" : "Stable"; }
  }

  updateEnvironmentIndicators(reading) {
    if (!reading) return;
    const ind = {
      tempIndicator: this.getEnvironmentStatus(reading.temperature, [15, 35, 20, 30], "temp"),
      humidityIndicator: this.getEnvironmentStatus(reading.humidity, [30, 80], "humidity"),
      soilIndicator: this.getEnvironmentStatus(reading.soil_moisture, [30, 80], "soil"),
      lightIndicator: this.getEnvironmentStatus(reading.light_intensity, [20, 90], "light"),
    };
    Object.entries(ind).forEach(([id, st]) => this.updateEnvironmentIndicator(id, st));
  }

  getEnvironmentStatus(value, th, type) {
    if (value === undefined) return { status: "", className: "env-indicator" };
    const ar = this.currentLang === "ar";
    const msg = {
      ar: {
        temp: { optimal: "الحرارة مثالية", warning: "الحرارة غير مناسبة", danger: "الحرارة خطيرة" },
        humidity: { optimal: "الرطوبة جيدة", warning: "الرطوبة غير مناسبة", danger: "الرطوبة سيئة" },
        soil: { optimal: "التربة رطبة", warning: "التربة تحتاج ري", danger: "التربة جافة" },
        light: { optimal: "الإضاءة كافية", warning: "الإضاءة ضعيفة", danger: "الإضاءة غير كافية" },
      },
      en: {
        temp: { optimal: "Temperature Optimal", warning: "Temperature Warning", danger: "Temperature Critical" },
        humidity: { optimal: "Humidity Good", warning: "Humidity Warning", danger: "Humidity Poor" },
        soil: { optimal: "Soil Moist", warning: "Soil Needs Water", danger: "Soil Dry" },
        light: { optimal: "Light Sufficient", warning: "Light Low", danger: "Light Insufficient" },
      },
    }[ar ? "ar" : "en"];

    let status, cls;
    if (type === "temp") {
      if (value < th[0] || value > th[1]) { status = msg.temp.danger; cls = "env-indicator danger"; }
      else if (value >= th[2] && value <= th[3]) { status = msg.temp.optimal; cls = "env-indicator optimal"; }
      else { status = msg.temp.warning; cls = "env-indicator warning"; }
    } else {
      if (value < th[0]) { status = msg[type].danger; cls = "env-indicator danger"; }
      else if (value > th[1]) { status = msg[type].warning; cls = "env-indicator warning"; }
      else { status = msg[type].optimal; cls = "env-indicator optimal"; }
    }
    return { status, className: cls };
  }

  updateEnvironmentIndicator(id, st) {
    const el = document.getElementById(id);
    if (!el) return;
    const t = el.querySelector("span");
    if (t) t.textContent = st.status;
    el.className = st.className;
  }
}

async function handleESP32Data(data) {
  try {
    await window.FirebaseHelper.addSensorReading(data);
    return { success: true, message: "Data received successfully" };
  } catch (e) {
    console.error("Save error:", e);
    return { success: false, message: "Error saving data" };
  }
}
document.addEventListener("DOMContentLoaded", () => {
  window.greenhouseApp = new GreenhouseApp();
});
window.handleESP32Data = handleESP32Data;
