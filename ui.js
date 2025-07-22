export let currentLang = 'en';
let isDark = false;

export function toArabicNumber(number) {
  return number.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
}

const translations = {
  en: {
    title: "🌿 Smart Greenhouse Dashboard",
    tempLabel: "🌡️ Temperature",
    humLabel: "💧 Humidity",
    lightLabel: "💡 Light",
    waterLabel: "🌊 Water Level",
    soilLabel: "🌱 Soil",
    timeLabel: "⏰ Time",
    langBtn: "عربي",
    footer: `Made by <a href="#">Ahmed</a> & <a href="#">Abdulmajeed</a>`
  },
  ar: {
    title: "🌿 لوحة تحكم البيت المحمي الذكي",
    tempLabel: "🌡️ الحرارة",
    humLabel: "💧 الرطوبة",
    lightLabel: "💡 الإضاءة",
    waterLabel: "🌊 مستوى الماء",
    soilLabel: "🌱 التربة",
    timeLabel: "⏰ الوقت",
    langBtn: "English",
    footer: `صُنع بواسطة <a href="#">أحمد</a> و <a href="#">عبدالمجيد</a>`
  }
};

window.toggleLanguage = function () {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  const t = translations[currentLang];

  document.getElementById("title").innerText = t.title;
  document.getElementById("tempLabel").innerText = t.tempLabel;
  document.getElementById("humLabel").innerText = t.humLabel;
  document.getElementById("lightLabel").innerText = t.lightLabel;
  document.getElementById("waterLabel").innerText = t.waterLabel;
  document.getElementById("soilLabel").innerText = t.soilLabel;
  document.getElementById("timeLabel").innerText = t.timeLabel;
  document.getElementById("langBtn").innerText = t.langBtn;
  document.getElementById("footer").innerHTML = t.footer;

  document.body.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
};

window.toggleTheme = function () {
  isDark = !isDark;
  document.body.classList.toggle('dark');
  document.getElementById("themeBtn").innerText = isDark ? "☀️" : "🌙";
};
