
# 🌿 Smart Greenhouse Dashboard

A smart monitoring and automation system for greenhouse environments using the ESP32 and Wokwi simulator. The dashboard is powered by **Blynk** and displays real-time data for temperature, humidity, light intensity, motion detection, irrigation, and pesticide control.

[![image](https://github.com/user-attachments/assets/3d73c744-ab07-4cd1-9653-b14c99618e6f)


]

(https://ahmedmagbool.github.io/-Smart-Greenhouse-Dashboard/)
---

## 🚀 Features

- 🌡️ Real-time **Temperature** and **Humidity** monitoring
- 💡 **Light Intensity** detection via LDR
- 🕵️‍♂️ **Motion Detection** using PIR sensor
- 🚿 Automated **Irrigation** control
- 🐛 Simulated **Pesticide Sprayer**
- 🕒 Live **Clock Display**
- 📊 Chart visualization of humidity and irrigation activity
- 🧪 Simulated with [Wokwi](https://wokwi.com/) and connected to Blynk Cloud
- 🌐 Hosted via **GitHub Pages**

---

## 🧩 Components (Simulated on Wokwi)

- ESP32 Dev Module
- DHT22 Sensor (Temp + Humidity)
- LDR Sensor (Light)
- PIR Motion Sensor
- 2 LEDs (Green for irrigation, Red for pesticide)
- DS1307 RTC Module

---

## 🔌 Blynk Setup

### Datastreams Configuration (Virtual Pins)

| Datastream  | Virtual Pin | Data Type | Min | Max | Units |
|-------------|-------------|------------|-----|-----|--------|
| Temperature | V0          | Double     | 0   | 50  | °C     |
| Humidity    | V1          | Double     | 0   | 100 | %      |
| Light       | V2          | Integer    | 0   | 4095| lx     |
| Motion      | V3          | Integer    | 0   | 1   |        |
| Irrigation  | V4          | Integer    | 0   | 1   |        |
| Pesticide   | V5          | Integer    | 0   | 1   |        |
| TimeStamp   | V6          | String     |     |     |        |

### Template Credentials

#define BLYNK_TEMPLATE_ID "TMPL6iJ89aYK1"
#define BLYNK_TEMPLATE_NAME "esp32 pro2"
#define BLYNK_AUTH_TOKEN "DlJZcZcY2eY8lEZ1fbrDSwpoRadDQ8_q"


## 🖥️ Web Dashboard Stack

* HTML / CSS / JS
* Chart.js for line chart
* Blynk HTTP API
* GitHub Pages for deployment

### 🔗 Live Dashboard

> [🌐 Open Smart Greenhouse Dashboard](https://ahmedmagbool.github.io/Smart-Greenhouse-Dashboard/)

---

## ⚙️ How to Run (Wokwi + Blynk)

1. Create a new Blynk Template with the datastreams above.
2. Copy your **Template ID**, **Template Name**, and **Auth Token** into the code.
3. Import the project into [Wokwi](https://wokwi.com/)
4. Simulate the ESP32 with the provided `sketch.ino`
5. Connect to Blynk cloud using your Wi-Fi credentials (use `Wokwi-GUEST`)
6. View live data on your web dashboard.

---

## 📁 Project Files

📦 Smart-Greenhouse-Dashboard/
├── index.html       # UI interface
├── styles.css       # CSS styles
├── script.js        # JS logic and Blynk fetch
├── sketch.ino       # ESP32 firmware
├── diagram.json     # Wokwi circuit layout
└── README.md        # Project description



## 🧠 Educational Purpose

This project is part of the **Tuwaiq Academy Embedded Systems Program** using **ESP32** and **IoT Cloud** tools. The goal is to simulate a smart farming solution that saves water and improves agricultural efficiency through automation.



## 👨‍💻 Developed By

**Ahmed Magbool**
**Abdulmajeed Alshammari**

🟣 Tuwaiq Academy – Embedded Systems Track
📆 July 2025



## 📝 License

This project is **open-source** and can be reused for educational or personal development.



