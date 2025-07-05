<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

  // Firebase config (استبدله بمعلومات مشروعك)
  const firebaseConfig = {
   apiKey: "AIzaSyAZeoxpSBsoC6lL-ziQgfFJMrTUNiDFhAg",
  authDomain: "esp32-b2aa3.firebaseapp.com",
  databaseURL: "https://esp32-b2aa3-default-rtdb.firebaseio.com",
  projectId: "esp32-b2aa3",
  storageBucket: "esp32-b2aa3.firebasestorage.app",
  messagingSenderId: "598432712887",
  appId: "1:598432712887:web:880c470b7b4a54d38f2532"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  let humidityData = [];
  let irrigationData = [];
  let timeLabels = [];

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
        x: {
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Value'
          }
        }
      }
    }
  });

  async function fetchLogData() {
    const snapshot = await get(child(ref(db), 'log'));
    if (snapshot.exists()) {
      const logs = snapshot.val();
      const sortedTimestamps = Object.keys(logs).sort(); // ترتيب حسب الوقت

      humidityData = [];
      irrigationData = [];
      timeLabels = [];

      sortedTimestamps.slice(-15).forEach(key => {
        const entry = logs[key];
        humidityData.push(entry.humidity);
        irrigationData.push(entry.irrigation);
        timeLabels.push(entry.time || key);  // يفضل استخدام timestamp كنص
      });

      chart.update();
    } else {
      console.log("No data available");
    }
  }

  setInterval(fetchLogData, 5000); // تحديث كل 5 ثوانٍ
</script>
