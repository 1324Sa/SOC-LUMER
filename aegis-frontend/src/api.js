const API_BASE = "http://localhost:8000"; // تأكد من مطابقة منفذ الـ FastAPI لديك

export async function fetchIncidents({ severity, incidentStatus, search, limit, offset }) {
  const params = new URLSearchParams();
  if (severity) params.append("severity", severity);
  if (incidentStatus) params.append("incident_status", incidentStatus);
  if (search) params.append("search", search);
  params.append("limit", limit);
  params.append("offset", offset);

  const res = await fetch(`${API_BASE}/api/v1/incidents?${params.toString()}`);
  if (!res.ok) throw new Error("فشل في جلب سجلات الحوادث الأمنية");
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/api/v1/incidents/metrics`);
  if (!res.ok) throw new Error("فشل في تحديث العدادات الرقمية");
  return res.json();
}

export async function fetchTimeline(minutes = 30) {
  const res = await fetch(`${API_BASE}/api/v1/incidents/timeline?minutes=${minutes}`);
  if (!res.ok) throw new Error("فشل في جلب المخطط الزمني");
  return res.json();
}

export async function deleteIncident(id) {
  const res = await fetch(`${API_BASE}/api/v1/incidents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("تعذر حذف السجل من قاعدة البيانات");
}

export function connectOpsStream({ onOpen, onClose, onError, onMessage }) {
  const ws = new WebSocket(`ws://localhost:8000/ws/ops-stream`);
  ws.onopen = onOpen;
  ws.onclose = onClose;
  ws.onerror = onError;
  ws.onmessage = (event) => {
    try {
      const { event: type, payload } = JSON.parse(event.data);
      onMessage(type, payload);
    } catch (e) {
      console.error("WS Parsing Error:", e);
    }
  };
  return ws;
}