// firebase-config.js (ESM via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  query,
  orderByChild,
  limitToLast,
  startAt,
  onValue,
  onChildAdded,
  off
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// ⚠️ تأكد من القيم لديك
const firebaseConfig = {
  apiKey: "AIzaSyDxDxv0UDU6PQb6GObEeSRt3VykG33XDHc",
  authDomain: "diss-94e07.firebaseapp.com",
  databaseURL: "https://diss-94e07-default-rtdb.firebaseio.com/",
  projectId: "diss-94e07",
  storageBucket: "diss-94e07.firebasestorage.app",
  messagingSenderId: "592050253592",
  appId: "1:592050253592:web:f137e934d8d18e1340386d",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// helper
function _lastFromSnap(snap) {
  const obj = snap.val();
  if (!obj) return null;
  const arr = Object.values(obj);
  return arr[arr.length - 1] ?? null;
}

const FirebaseHelper = {
  addSensorReading: (data) => {
    const ts = Date.now();
    const sensorData = { ...data, timestamp: ts, created_at: new Date(ts).toISOString() };
    return push(ref(database, "sensor_readings"), sensorData);
  },

  // يرجّع Object مباشرة (أحدث قراءة)
  getLatestReading: (cb) => {
    const q = query(ref(database, "sensor_readings"), orderByChild("timestamp"), limitToLast(1));
    onValue(q, (snap) => cb(_lastFromSnap(snap)));
  },

  // يرجّع Object {id: reading, ...} لآخر 24 ساعة
  getLast24Hours: (cb) => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const q = query(ref(database, "sensor_readings"), orderByChild("timestamp"), startAt(since));
    onValue(q, (snap) => cb(snap.val() ?? {}));
  },

  // يرجّع Object لآخر ساعة
  getLastHour: (cb) => {
    const since = Date.now() - 60 * 60 * 1000;
    const q = query(ref(database, "sensor_readings"), orderByChild("timestamp"), startAt(since));
    onValue(q, (snap) => cb(snap.val() ?? {}));
  },

  // بث القراءة الجديدة كـ Object
  watchRealTimeUpdates: (cb) => {
    const q = query(ref(database, "sensor_readings"), orderByChild("timestamp"), limitToLast(1));
    onChildAdded(q, (snap) => cb(snap.val()));
  },

  stopWatching: (eventType = "value", cb) => {
    off(ref(database, "sensor_readings"), eventType, cb);
  },
};

window.FirebaseHelper = FirebaseHelper;
export default FirebaseHelper;
