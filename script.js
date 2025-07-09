import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { currentLang, toArabicNumber } from './ui.js';

const firebaseConfig = {
  apiKey: "AIzaSyAZeoxpSBsoC6lL-ziQgfFJMrTUNiDFhAg",
  authDomain: "esp32-b2aa3.firebaseapp.com",
  databaseURL: "https://esp32-b2aa3-default-rtdb.firebaseio.com",
  projectId: "esp32-b2aa3",
  storageBucket: "esp32-b2aa3.appspot.com",
  messagingSenderId: "598432712887",
  appId: "1:598432712887:web:880c470b7b4a54d38f2532"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let humidityData = [], irrigationData = [], timeLabels = [];

const ctx = document.getElementById('humidityChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [
      {
        label: 'Humidity (%)',
        data: humidityData,
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.1)',
        fill: true
      },
      {
        label: 'Irrigation (ON=1, OFF=0)',
        data: irrigationData,
        borderColor: 'green',
        backgroundColor: 'rgba(0,255,0,0.1)',
        fill: true
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Time' } },
      y: { beginAtZero: true, title: { display: true, text: 'Value' } }
    }
  }
});

function formatTimestamp(rawKey) {
  const [date, time] = rawKey.split('_');
  return `${date} ${time}`;
}

async function fetchLogData() {
  const snapshot = await get(child(ref(db), 'log'));
  if (snapshot.exists()) {
    const logs = snapshot.val();
    const sortedTimestamps = Object.keys(logs).sort();

    humidityData.length = 0;
    irrigationData.length = 0;
    timeLabels.length = 0;

    const latestKey = sortedTimestamps[sortedTimestamps.length - 1];
    const latestEntry = logs[latestKey];

    if (currentLang === 'ar') {
      document.getElementById("temp").innerText = toArabicNumber(latestEntry.temperature) + " °م";
      document.getElementById("hum").innerText = toArabicNumber(latestEntry.humidity) + " ٪";
      document.getElementById("light").innerText = toArabicNumber(latestEntry.light);
      document.getElementById("motion").innerText = latestEntry.motion === 1 ? "تشغيل" : "إيقاف";
      document.getElementById("irrigation").innerText = latestEntry.irrigation === 1 ? "تشغيل" : "إيقاف";
      document.getElementById("pesticide").innerText = latestEntry.pesticide === 1 ? "تشغيل" : "إيقاف";
      document.getElementById("time").innerText = toArabicNumber(formatTimestamp(latestKey));
    } else {
      document.getElementById("temp").innerText = latestEntry.temperature + " °C";
      document.getElementById("hum").innerText = latestEntry.humidity + " %";
      document.getElementById("light").innerText = latestEntry.light;
      document.getElementById("motion").innerText = latestEntry.motion === 1 ? "ON" : "OFF";
      document.getElementById("irrigation").innerText = latestEntry.irrigation === 1 ? "ON" : "OFF";
      document.getElementById("pesticide").innerText = latestEntry.pesticide === 1 ? "ON" : "OFF";
      document.getElementById("time").innerText = formatTimestamp(latestKey);
    }

    sortedTimestamps.slice(-15).forEach(key => {
      const entry = logs[key];
      humidityData.push(entry.humidity);
      irrigationData.push(entry.irrigation);
      timeLabels.push(formatTimestamp(key));
    });

    chart.update();
  } else {
    console.log("No data available");
  }
}

setInterval(fetchLogData, 5000);
