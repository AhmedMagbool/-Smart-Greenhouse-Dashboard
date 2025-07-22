import { currentLang, toArabicNumber } from './ui.js';

const ctx = document.getElementById('chart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Humidity (%)',
        data: [],
        borderColor: 'blue',
        yAxisID: 'y'
      },
      {
        label: 'Water Level',
        data: [],
        borderColor: 'green',
        yAxisID: 'y1'
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        position: 'left',
        title: { display: true, text: 'Humidity (%)' }
      },
      y1: {
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Water Level' }
      }
    }
  }
});

const url = "https://greenhouse-cb489-default-rtdb.firebaseio.com/greenhouse.json";

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (!data) return;

    const labels = [], humData = [], waterData = [];

    Object.entries(data).forEach(([key, item]) => {
      labels.push(currentLang === 'ar' ? toArabicNumber(key) : key);
      humData.push(item.humidity ?? 0);
      waterData.push(item.waterLevel ?? 0);  // ✅ التعديل هنا
    });

    chart.data.labels = labels;
    chart.data.datasets[0].data = humData;
    chart.data.datasets[1].data = waterData;
    chart.update();
  });
