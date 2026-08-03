import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityTickerProps {
  logs: ActivityLog[];
}

export const ActivityTicker: React.FC<ActivityTickerProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 text-slate-300 border-b border-slate-800 h-8 px-4 text-xs font-mono flex items-center gap-3 overflow-hidden shadow-inner">
      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-600 text-white font-bold text-[10px] rounded uppercase tracking-wider shrink-0 shadow-sm">
        <Zap className="w-3 h-3" />
        <span>Live Log</span>
      </div>

      <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-6 whitespace-nowrap">
        {logs && logs.length > 0 ? (
          logs.map((log, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 text-[10px]">{log.time}</span>
              <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                log.action === 'CREATE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                log.action === 'APPROVE' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                log.action === 'UPDATE' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-slate-800 text-slate-300'
              }`}>
                {log.action}
              </span>
              <span className="text-slate-200 font-medium">{log.detail}</span>
              <span className="text-slate-500 text-[10px]">by {log.user}</span>
              {idx < logs.length - 1 && <span className="text-slate-700">|</span>}
            </div>
          ))
        ) : (
          <span className="text-slate-500 text-xs">BMS Dashboard v4.0 (02 Agustus 2026) High Density System Active & Monitoring...</span>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0 border-l border-slate-800 pl-3">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>GAS Synchronized</span>
      </div>
    </div>
  );
};
