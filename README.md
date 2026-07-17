# 🛡️ Aegis Cyber Ops - Real-Time SOC Dashboard

A fully interactive, high-performance **Security Operations Center (SOC) Dashboard** simulation designed to monitor network traffic, track cybersecurity threats, and analyze event logs in real time. This project features a highly optimized, enterprise-grade dark-themed user interface modeled after live dashboards used by cybersecurity professionals.

---

## 🚀 Project Overview

**Aegis Cyber Ops** is built to bridge the gap between raw security log data and actionable visual intelligence. Utilizing a decoupled architecture, the frontend communicates seamlessly with an asynchronous backend stream. This allows Security Analysts to quickly triaging incidents, identifying patterns, and mitigating risks to critical infrastructure before they escalate.

---

## ✨ Core Cybersecurity Features

* **⚡ Real-Time Threat Stream:** Simulates live cyberattacks (such as DDoS, SQL Injection, and Phishing) streaming instantly into the dashboard via asynchronous processes without requiring any page refreshes.
* **📊 Security Metrics & KPIs:** Live counter widgets tracking overall threats detected, the current maximum severity level, and total incidents successfully mitigated/blocked.
* **🎯 Threat Triage & Severity Categorization:** Automated smart classification of security events based on risk levels (`Critical`, `High`, `Medium`, `Low`) to help analysts prioritize incident responses.
* **🔍 Advanced Log Management:** An interactive, state-driven log table supporting instant fuzzy search, chronological sorting, and granular multi-filters for attack types, source/destination IPs, and timestamps.
* **🚨 Instant Alerting System:** Live pop-up alerts (Toast Notifications) trigger immediately upon the simulation of a `Critical` vulnerability to instantly capture the analyst's attention.

---

## 🛠️ Tech Stack

### 💻 Frontend (Visual & State Management)
* **React.js** (Component-based architecture for a modular, lightning-fast UI)
* **Tailwind CSS** (Modern utility-first CSS framework for a responsive, dark-mode layout)
* **Recharts** (Composed charts for rendering dynamic, multi-axis data visualizations)
* **Lucide React** (Crisp, modern iconography specialized for security platforms)

### ⚙️ Backend (Simulation & Streaming Engine)
* **Python & FastAPI** (High-performance, production-ready asynchronous web framework)
* **WebSockets / Async Loops** (Engineered to generate and push randomized, realistic security event logs every 4 seconds to mimic a live network environment)

---

## ⚙️ Installation & Setup

To get this project running locally on your machine, follow these steps:

### 1️⃣ Spin up the Backend Server
```bash
cd aegis-backend
pip install fastapi uvicorn
uvicorn main:app --reload

```

### 2️⃣ Run the Frontend Application

```bash
cd aegis-frontend
npm install
npm run dev

```

---

## 🔒 License

This repository is open-source and intended purely for educational, simulation, and portfolio demonstration purposes.

```

---

### 💡 Next Step:
Save this file, and then push it to your repository using your terminal:
```bash
git add README.md
git commit -m "docs: add professional English README description"
git push origin main -f

```
