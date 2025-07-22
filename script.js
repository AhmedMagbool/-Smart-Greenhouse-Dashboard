import { currentLang, toArabicNumber } from './ui.js';

const dbUrl = "https://greenhouse-cb489-default-rtdb.firebaseio.com/greenhouse.json";

function fetchData() {
  fetch(dbUrl)
    .then(res => res.json())
    .then(data => {
      document.getElementById("tempVal").innerText = data.temperature ? data.temperature + " °C" : "--";
      document.getElementById("humVal").innerText = data.humidity ? data.humidity + " %" : "--";
      document.getElementById("lightVal").innerText = data.light ?? "--";
      document.getElementById("waterVal").innerText = data.waterLevel ?? "--";
      document.getElementById("soilVal").innerText = data.soil ?? "--";
      document.getElementById("timeVal").innerText = currentLang === 'ar' ? toArabicNumber(data.timestamp) : data.timestamp;
    })
    .catch(err => console.error("Fetch Error:", err));
}

setInterval(fetchData, 3000);
fetchData();
