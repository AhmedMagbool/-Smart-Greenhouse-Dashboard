const token = "WNxEKyaOf7Um1BBhNvGc3f2L7cK51y7h";
const base = "https://blynk.cloud/external/api/get";

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

const updateValue = async (vpin, elementId, format = (v) => v, callback = null) => {
  try {
    const res = await fetch(`${base}?token=${token}&v${vpin}`);
    const value = await res.text();
    const cleanVal = value.trim();
    console.log(`V${vpin}: ${cleanVal}`);
    document.getElementById(elementId).innerText = format(cleanVal);
    if (callback) callback(cleanVal);
  } catch (e) {
    console.error(`Error fetching V${vpin}:`, e);
    document.getElementById(elementId).innerText = "--";
  }
};

function fetchAll() {
  updateValue("0", "temp", (v) => `${parseFloat(v).toFixed(1)} °C`);
  updateValue("1", "hum", (v) => {
    let humidity = parseFloat(v).toFixed(1);
    humidityData.push(humidity);
    if (humidityData.length > 15) humidityData.shift();
    return `${humidity} %`;
  });
  updateValue("2", "light");
  updateValue("3", "motion", (v) => v === "1" ? "ON" : "OFF");
  updateValue("4", "irrigation", (v) => {
    irrigationData.push(parseInt(v));
    if (irrigationData.length > 15) irrigationData.shift();
    return v === "1" ? "ON" : "OFF";
  });
  updateValue("5", "pesticide", (v) => v === "1" ? "ON" : "OFF");
  updateValue("6", "time", (v) => {
    timeLabels.push(v);
    if (timeLabels.length > 15) timeLabels.shift();
    chart.update();
    return v;
  });
}

setInterval(fetchAll, 5000);
