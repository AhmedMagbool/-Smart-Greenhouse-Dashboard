/* ========= CONFIG ========= */
const token = "WNxEKyaOf7Um1BBhNvGc3f2L7cK51y7h";
const base  = "https://blynk.cloud/external/api/get";

/* ========= CHART SETUP ========= */
let humidityData   = [];
let irrigationData = [];
let labels         = [];

const ctx = document.getElementById("humidityChart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Humidity (%)",
        data: humidityData,
        borderColor: "blue",
        backgroundColor: "rgba(0,0,255,.1)",
        tension: .2,
        fill: true
      },
      {
        label: "Irrigation (0/1)",
        data: irrigationData,
        borderColor: "green",
        backgroundColor: "rgba(0,255,0,.1)",
        tension: .2,
        fill: true
      }
    ]
  },
  options: {
    scales:{
      x:{title:{display:true,text:"Time"}},
      y:{beginAtZero:true,title:{display:true,text:"Value"}}
    }
  }
});

/* ========= FETCH HELPER ========= */
async function getVPin(vpin){
  const res = await fetch(`${base}?token=${token}&v${vpin}`);
  if(!res.ok) throw new Error(res.status);
  return (await res.text()).trim();
}

/* ========= UPDATE DOM ========= */
async function fetchAll(){
  try{
    const [t,h,l,m,irr,pest,time] = await Promise.all([
      getVPin(0), getVPin(1), getVPin(2),
      getVPin(3), getVPin(4), getVPin(5), getVPin(6)
    ]);

    // temperature & humidity
    document.getElementById("temp").innerText = `${parseFloat(t).toFixed(1)} °C`;
    document.getElementById("hum").innerText  = `${parseFloat(h).toFixed(1)} %`;

    // light
    document.getElementById("light").innerText = l;

    // motion
    document.getElementById("motion").innerText = m === "1" ? "ON" : "OFF";

    // irrigation & pesticide
    document.getElementById("irrigation").innerText = irr === "1" ? "ON" : "OFF";
    document.getElementById("pesticide").innerText  = pest === "1" ? "ON" : "OFF";

    // time
    document.getElementById("time").innerText = time;

    /* ---- Push to chart ---- */
    labels.push(time);
    humidityData.push(parseFloat(h));
    irrigationData.push(parseInt(irr));

    const MAX = 15;          // آخر 15 نقطة
    if(labels.length > MAX){
      labels.shift();
      humidityData.shift();
      irrigationData.shift();
    }

    chart.update();

  }catch(err){
    // إذا تجاوزت الحد، اهمل التحديث فقط
    console.warn("Fetch error / rate-limit hit:", err);
  }
}

/* ========= RUN INTERVAL ========= */
fetchAll();                              // أول تشغيل
setInterval(fetchAll, 60000);            // كل 60 ثانية
