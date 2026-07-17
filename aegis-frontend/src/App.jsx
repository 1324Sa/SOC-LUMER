import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, Radio, Server, Search, RefreshCw, CheckCircle, Globe, Terminal } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// إعدادات عناوين الاتصال بالسيرفر الافتراضي
const API_URL = "http://localhost:8000/api/v1";
const WS_URL = "ws://localhost:8000/ws/ops-stream";

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState({ total_attacks: 0, blocked_attacks: 0, critical_alerts: 0, high_alerts: 0, system_status: "LOADING" });
  const [timelineData, setTimelineData] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("DISCONNECTED");
  const [toast, setToast] = useState(null);
  const wsRef = useRef(null);

  // دالة جلب البيانات الأساسية من الـ API
  const loadDashboardData = async () => {
    try {
      const resIncidents = await fetch(`${API_URL}/incidents?severity=${filterSeverity}&search=${searchQuery}`);
      if (resIncidents.ok) setIncidents(await resIncidents.json());

      const resMetrics = await fetch(`${API_URL}/incidents/metrics`);
      if (resMetrics.ok) setMetrics(await resMetrics.json());

      const resTimeline = await fetch(`${API_URL}/incidents/timeline`);
      if (resTimeline.ok) setTimelineData(await resTimeline.json());
    } catch (err) {
      console.error("خطأ أثناء تحديث بيانات مركز العمليات الأمنية:", err);
    }
  };

  // إعداد وإدارة البث الحي التلقائي للـ WebSockets
  useEffect(() => {
    loadDashboardData();

    function connectWS() {
      setConnectionStatus("CONNECTING");
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setConnectionStatus("CONNECTED");
      ws.onclose = () => {
        setConnectionStatus("DISCONNECTED");
        setTimeout(connectWS, 5000); // إعادة اتصال تلقائية بعد 5 ثوانٍ عند انقطاع السيرفر
      };
      ws.onerror = () => setConnectionStatus("ERROR");

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.event === "INCIDENT_CREATED") {
          const newIncident = data.payload;
          
          // تحديث جدول السجلات فوراً بإضافة التهديد الجديد في الأعلى
          setIncidents(prev => [newIncident, ...prev]);
          
          // تحديث العدادات الرقمية بناءً على الهجوم الجديد
          setMetrics(prev => ({
            ...prev,
            total_attacks: prev.total_attacks + 1,
            blocked_attacks: newIncident.status === "BLOCKED" ? prev.blocked_attacks + 1 : prev.blocked_attacks,
            critical_alerts: newIncident.severity === "CRITICAL" ? prev.critical_alerts + 1 : prev.critical_alerts,
            high_alerts: newIncident.severity === "HIGH" ? prev.high_alerts + 1 : prev.high_alerts,
          }));

          // إظهار تنبيه منبثق فوري في حال كان التهديد خطيراً أو حرجاً
          if (newIncident.severity === "CRITICAL" || newIncident.severity === "HIGH") {
            setToast({
              type: newIncident.severity,
              message: `⚠️ كشف تهديد ${newIncident.severity}: محاولة ${newIncident.type} من مصدر IP [${newIncident.source_ip}]`
            });
            setTimeout(() => setToast(null), 5000);
          }
        }
      };
    }

    connectWS();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [filterSeverity, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      
      {/* شريط النظام والتنبيهات المنبثقة العلوي */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-2xl animate-bounce max-w-md ${toast.type === 'CRITICAL' ? 'bg-red-950/90 border-red-500 text-red-200' : 'bg-orange-950/90 border-orange-500 text-orange-200'}`}>
          <AlertTriangle className="w-6 h-6 animate-pulse" />
          <p className="text-sm font-bold font-mono">{toast.message}</p>
        </div>
      )}

      {/* الهيدر الرئيسي لغرفة التحكم */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/50 rounded-lg border border-cyan-500/30 text-cyan-400">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-white">CYBERSECURITY OPERATION CENTER (SOC)</h1>
            <p className="text-xs text-slate-400 font-mono">LIVE INTELLIGENCE MONITORING DASHBOARD</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* مؤشر حالة البث الحي للشبكة */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`}></span>
            <span className="text-slate-400">STREAM STATUS:</span>
            <span className={connectionStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-red-400'}>{connectionStatus}</span>
          </div>

          <button onClick={loadDashboardData} className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        
        {/* صف كروت الأداء ومؤشرات الـ KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900/50 border border-slate-900 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase">TOTAL THREATS DETECTED</p>
              <h3 className="text-2xl font-black font-mono text-white mt-1">{metrics.total_attacks}</h3>
            </div>
            <Radio className="w-8 h-8 text-cyan-500 opacity-60" />
          </div>

          <div className="bg-slate-900/50 border border-slate-900 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase">ATTACKS BLOCKED</p>
              <h3 className="text-2xl font-black font-mono text-emerald-400 mt-1">{metrics.blocked_attacks}</h3>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500 opacity-60" />
          </div>

          <div className="bg-slate-900/50 border border-slate-900 rounded-xl p-4 flex items-center justify-between border-l-red-500/50">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase">CRITICAL SEVERITY</p>
              <h3 className="text-2xl font-black font-mono text-red-500 mt-1">{metrics.critical_alerts}</h3>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500 opacity-60" />
          </div>

          <div className="bg-slate-900/50 border border-slate-900 rounded-xl p-4 flex items-center justify-between border-l-orange-500/50">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase">HIGH SEVERITY</p>
              <h3 className="text-2xl font-black font-mono text-orange-400 mt-1">{metrics.high_alerts}</h3>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-400 opacity-60" />
          </div>

          <div className="bg-slate-900/50 border border-slate-900 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase">FIREWALL ECOSYSTEM</p>
              <h3 className={`text-sm font-bold font-mono mt-2 px-2 py-0.5 rounded ${metrics.system_status === 'OPERATIONAL' ? 'bg-emerald-950/80 text-emerald-400' : 'bg-red-950/80 text-red-400'}`}>
                {metrics.system_status}
              </h3>
            </div>
            <Server className="w-8 h-8 text-slate-500 opacity-60" />
          </div>
        </div>

        {/* قسم الرسم البياني التفاعلي للمخطط الزمني */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-4">
          <p className="text-xs font-mono text-slate-400 mb-4 uppercase tracking-wider">🔒 LIVE HISTORICAL TRAFFIC & SEVERITY MAP</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="Critical" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                <Area type="monotone" dataKey="High" stroke="#f97316" fill="#f97316" fillOpacity={0.05} />
                <Area type="monotone" dataKey="Medium" stroke="#eab308" fill="#eab308" fillOpacity={0.02} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* فلاتر التحكم، التصفية وأدوات البحث الفوري */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-900">
          <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="البحث بواسطة IP أو نوع الهجوم..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none w-full sm:w-64 text-right"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-mono text-slate-500">SEVERITY FILTER:</span>
            <select 
              value={filterSeverity} 
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg outline-none cursor-pointer"
            >
              <option value="">جميع المستويات (ALL)</option>
              <option value="CRITICAL">CRITICAL (حرج)</option>
              <option value="HIGH">HIGH (عالي)</option>
              <option value="MEDIUM">MEDIUM (متوسط)</option>
              <option value="LOW">LOW (منخفض)</option>
            </select>
          </div>
        </div>

        {/* جدول السجلات والعمليات الأمنية الرئيسي */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-xl overflow-hidden">
          <div className="p-4 bg-slate-900/60 border-b border-slate-900 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">🛡️ SECURITY EVENT INTELLIGENCE LOGS</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-900">REAL-TIME FEEDS</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-900">
                <tr>
                  <th className="p-3">Incident ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Threat Vector</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Source IP</th>
                  <th className="p-3">Target Port</th>
                  <th className="p-3">Geo Origin</th>
                  <th className="p-3 text-right">Action Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-slate-300">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500 font-mono text-xs">
                      ❌ لا توجد سجلات مطابقة لخيارات البحث الحالية
                    </td>
                  </tr>
                ) : (
                  incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 text-cyan-500 font-bold">{inc.id}</td>
                      <td className="p-3 text-slate-500">{inc.timestamp}</td>
                      <td className="p-3 text-white font-semibold">{inc.type}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-900' :
                          inc.severity === 'HIGH' ? 'bg-orange-950 text-orange-400 border border-orange-900' :
                          inc.severity === 'MEDIUM' ? 'bg-yellow-950 text-yellow-400 border border-yellow-900' :
                          'bg-blue-950 text-blue-400 border border-blue-900'
                        }`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-bold">{inc.source_ip}</td>
                      <td className="p-3 text-slate-400">
                        <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[11px]">
                          {inc.port} · {inc.port === 22 ? 'SSH' : inc.port === 443 ? 'HTTPS' : inc.port === 80 ? 'HTTP' : 'Custom'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-sans">🌐 {inc.country}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${inc.status === 'BLOCKED' ? 'text-emerald-400 bg-emerald-950/50' : 'text-amber-400 bg-amber-950/50'}`}>
                          {inc.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}