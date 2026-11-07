import React from 'react';
import { ShieldAlert, AlertTriangle, Info, X } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const LiveToastStream: React.FC = () => {
  const { recentToasts, dismissToast, setActiveTab } = useDashboard();

  if (recentToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2 max-w-sm w-full pointer-events-none">
      {recentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'critical'
              ? 'bg-rose-950/90 text-white border-rose-700'
              : toast.type === 'warning'
              ? 'bg-amber-950/90 text-white border-amber-700'
              : 'bg-slate-900/90 text-white border-slate-700'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'critical' ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <Info className="w-5 h-5 text-indigo-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold leading-tight">{toast.title}</div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
            {toast.type !== 'info' && (
              <button
                onClick={() => setActiveTab('watchlist')}
                className="mt-1.5 text-[10px] font-bold text-rose-300 hover:text-white underline"
              >
                Inspect in Watchlist &rarr;
              </button>
            )}
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};