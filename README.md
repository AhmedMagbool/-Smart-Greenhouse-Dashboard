<img width="1900" height="870" alt="image" src="https://github.com/user-attachments/assets/f4e3f3a3-09dd-4db4-aabf-ba5d18eaa8a7" /># 🌿 Smart Greenhouse Monitoring System

A full-stack IoT project for monitoring greenhouse conditions using real-time sensor data and a modern web dashboard. Built using **ESP32**, **MongoDB**, **Node.js**, and a responsive frontend with **Chart.js**, **i18next**, and support for dark mode and Arabic/English languages.

---

<img width="1919" height="876" alt="image" src="https://github.com/user-attachments/assets/2bdb3f50-aa85-462b-8348-627fea88b227" />

> 🔴 Live Demo: [GitHub Pages Link](https://ahmedmagbool.github.io/Smart-GreenhouseDashboard/)  
<img width="1900" height="870" alt="image" src="https://github.com/user-attachments/assets/4645b873-ed86-4af2-b8e8-1cc2bbc9f2f7" />

---

## 🧠 Features

- 🌡️ Live monitoring of:
  - Temperature  
  - Humidity  
  - Light level  
  - Water tank level  
  - Soil moisture  
  - Time (from RTC)

- 📈 Real-time chart (Temperature + Light)

- 🌓 Dark mode support

- 🌐 Language toggle (Arabic / English)

- 🔒 Sensor data stored securely in MongoDB

---

## 🧩 Tech Stack

| Part           | Technology                    |
|----------------|-------------------------------|
| Microcontroller | ESP32 + Real sensors (DHT11, LDR, Soil, Water Level, RTC) |
| Backend        | Node.js + Express + MongoDB   |
| Frontend       | HTML + CSS + Vanilla JS + Chart.js |
| Database       | MongoDB Atlas / Local MongoDB |
| Deployment     | GitHub Pages (Frontend) + Local Server (Backend) |

---

## 🗂️ Project Structure

smart-greenhouse/
├── backend/ # Express API + MongoDB
│ ├── index.js
│ ├── models/Sensor.js
│ └── .env
├── frontend/ # Dashboard
│ ├── index.html
│ ├── style.css
│ ├── script.js
│ ├── ui.js
│ └── chart.js
├── arduino/ # ESP32 Code
│ └── esp32_code.ino
└── README.md

yaml
Copy code

---

## 🚀 How It Works

1. **ESP32** reads data from sensors every few seconds.
2. Sends readings as JSON to the **Node.js backend** via HTTP `POST`.
3. Backend stores readings into **MongoDB**.
4. The **dashboard frontend** (hosted on GitHub Pages) fetches latest data via `/api/sensors/latest`.
5. Real-time values and charts are updated automatically.

---

## ⚙️ Setup Instructions

### 🔧 Backend

1. Install dependencies:
   ```bash
   cd backend
   npm install
Create a .env file:

env
Copy code
MONGO_URI=mongodb://localhost:27017/greenhouse
Start server:

bash
Copy code
node index.js
🔌 ESP32
Upload esp32_code.ino via Arduino IDE. Set WiFi credentials and server IP in the sketch.

🖥️ Frontend
Open frontend/index.html or deploy to GitHub Pages.

👨‍💻 Made By
Ahmed
