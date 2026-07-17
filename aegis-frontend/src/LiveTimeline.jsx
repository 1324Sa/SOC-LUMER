import React from 'react';

export default function LiveTimeline({ buckets = [], minutes = 30 }) {
  const maxTotal = Math.max(...buckets.map(b => b.total), 1);

  return (
    <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 shadow-md text-right">
      <div className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-3 flex items-center justify-end gap-2 font-mono">
        <span>LIVE INCIDENT TIMELINE (LAST {minutes} MINS)</span>
        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
      </div>
      
      <div className="flex items-end gap-1 h-24 pt-2 overflow-x-auto select-none direction-ltr">
        {buckets.map((b, i) => {
          const pct = (b.total / maxTotal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative min-w-[14px]">
              
              {/* التلميح المنبثق عند تمرير الفأرة فوق الدقيقة */}
              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-950 border border-slate-800 p-2 rounded text-[10px] text-slate-300 pointer-events-none z-50 shadow-2xl min-w-[110px] text-left font-mono">
                <div className="text-cyan-400 font-bold border-b border-slate-800 pb-1 mb-1">{b.minute_bucket.split(' ')[1]}</div>
                <div className="text-red-400">Critical: {b.critical}</div>
                <div className="text-orange-400">High: {b.high}</div>
                <div className="text-yellow-400">Medium: {b.medium}</div>
                <div className="text-blue-400">Low: {b.low}</div>
                <div className="text-white font-bold border-t border-slate-800 mt-1 pt-1">Total: {b.total}</div>
              </div>
              
              {/* عَمود الرسم البياني التراكمي الملون حسب خطورة الهجوم */}
              <div className="w-full bg-slate-900/40 rounded-t overflow-hidden flex flex-col justify-end transition-all duration-300" style={{ height: `${Math.max(pct, 8)}%` }}>
                <div className="bg-blue-500/80" style={{ height: b.total ? `${(b.low / b.total) * 100}%` : '0%' }}></div>
                <div className="bg-yellow-500/80" style={{ height: b.total ? `${(b.medium / b.total) * 100}%` : '0%' }}></div>
                <div className="bg-orange-500/80" style={{ height: b.total ? `${(b.high / b.total) * 100}%` : '0%' }}></div>
                <div className="bg-red-500 shadow-[0_0_6px_#ef4444]" style={{ height: b.total ? `${(b.critical / b.total) * 100}%` : '0%' }}></div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between text-[10px] text-slate-600 font-bold font-mono mt-2 border-t border-slate-900 pt-1">
        <span>NOW</span>
        <span>{minutes}M AGO</span>
      </div>
    </div>
  );
}