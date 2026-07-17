import asyncio
import json
import random
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SOC Dashboard API - Production Ready")

# تفعيل الـ CORS لضمان استقبال المتصفح للبيانات دون حظر
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # في بيئة التطوير نسمح لجميع المنافذ بالاتصال
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# قاعدة بيانات مؤقتة للحوادث السيبرانية المباشرة
incidents_db = []
severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
attack_types = ["DDoS Attack", "Brute Force SSH", "SQL Injection", "Ransomware Drop", "Phishing Attempt", "Malware Execution"]
countries = ["US", "SA", "DE", "CN", "RU", "GB", "FR", "NL"]
ports = [22, 80, 443, 3389, 8080]

# توليد بيانات أولية عند تشغيل السيرفر
for i in range(25):
    incidents_db.append({
        "id": f"INC-{1000+i}",
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "type": random.choice(attack_types),
        "severity": random.choice(severities),
        "source_ip": f"{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}",
        "country": random.choice(countries),
        "status": random.choice(["BLOCKED", "INVESTIGATING", "MITIGATED"]),
        "port": random.choice(ports)
    })

@app.get("/api/v1/incidents")
async def get_incidents(severity: str = None, search: str = None):
    filtered = incidents_db.copy()
    if severity:
        filtered = [x for x in filtered if x["severity"] == severity.upper()]
    if search:
        filtered = [x for x in filtered if search.lower() in x["type"].lower() or search in x["source_ip"]]
    return sorted(filtered, key=lambda x: x["timestamp"], reverse=True)

@app.get("/api/v1/incidents/metrics")
async def get_metrics():
    total = len(incidents_db)
    blocked = len([x for x in incidents_db if x["status"] == "BLOCKED"])
    critical = len([x for x in incidents_db if x["severity"] == "CRITICAL"])
    high = len([x for x in incidents_db if x["severity"] == "HIGH"])
    return {
        "total_attacks": total,
        "blocked_attacks": blocked,
        "critical_alerts": critical,
        "high_alerts": high,
        "system_status": "UNDER ATTACK" if critical > 3 else "OPERATIONAL"
    }

@app.get("/api/v1/incidents/timeline")
async def get_timeline():
    return [
        {"time": "18:00", "Low": 12, "Medium": 8, "High": 4, "Critical": 1},
        {"time": "19:00", "Low": 15, "Medium": 10, "High": 7, "Critical": i % 3},
        {"time": "20:00", "Low": 8, "Medium": 14, "High": 9, "Critical": 2},
        {"time": "21:00", "Low": len(incidents_db)//4, "Medium": len(incidents_db)//5, "High": len(incidents_db)//6, "Critical": len([x for x in incidents_db if x["severity"] == "CRITICAL"])},
    ]

# إدارة اتصالات الـ WebSockets للبث الحي
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws/ops-stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # محاكاة هجوم جديد كل 4 ثوانٍ وإرساله فوراً للمتصفح دون عمل Refresh
            await asyncio.sleep(4)
            new_incident = {
                "id": f"INC-{random.randint(5000, 9999)}",
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "type": random.choice(attack_types),
                "severity": random.choice(severities),
                "source_ip": f"{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}",
                "country": random.choice(countries),
                "status": random.choice(["BLOCKED", "INVESTIGATING"]),
                "port": random.choice(ports)
            }
            incidents_db.append(new_incident)
            await manager.broadcast(json.dumps({"event": "INCIDENT_CREATED", "payload": new_incident}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)