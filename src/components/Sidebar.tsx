import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  ShieldAlert,
  BarChart2,
  Settings,
  Lock,
  Unlock,
  ArrowRight,
  BookOpen,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useDashboard, TabKey } from '../context/DashboardContext';
import { DataSheetSyncModal } from './DataSheetSyncModal';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    metrics,
    records,
    isSettingsUnlocked,
    pollNow,
    isSyncing,
  } = useDashboard();

  const [syncModalOpen, setSyncModalOpen] = useState<boolean>(false);

  const navItems: Array<{ id: TabKey; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'login-log', label: 'Login Log', icon: <FileText className="w-5 h-5" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-5 h-5" /> },
    { id: 'watchlist', label: 'Watchlist', icon: <ShieldAlert className="w-5 h-5" />, badge: metrics.flaggedStudentsCount },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
        <div>
          {/* Top Brand */}
          <div className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3B5BDB] to-[#4C6EF5] flex items-center justify-center text-white shadow-sm shadow-indigo-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-lg leading-tight tracking-tight">LibraWatch</div>
              <div className="text-xs text-slate-400 font-medium">Library access monitoring</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 pt-2 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#3B5BDB] text-white shadow-sm shadow-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold tabular-nums ${
                          isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.id === 'settings' && (
                      <span className="text-xs opacity-70">
                        {isSettingsUnlocked ? (
                          <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: DataSheet Sync Card & Suspicious login watch */}
        <div className="p-4 space-y-3">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  DataSheet Sync
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded font-semibold">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Current rows:</span>
              <span className="font-bold font-mono text-slate-800">{records.length.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => pollNow()}
                disabled={isSyncing}
                className="py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Check</span>
              </button>
              <button
                onClick={() => setSyncModalOpen(true)}
                className="py-1 px-2 rounded-lg bg-slate-900 text-white text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Data</span>
              </button>
            </div>
          </div>

          {/* Suspicious login watch Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Suspicious login watch</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Flagged at 2+ failed attempts, or 3 attempts within 10 min.
            </p>

            <div className="space-y-1 pt-1 text-xs font-medium">
              <div className="flex justify-between items-center text-slate-600">
                <span>Flagged students</span>
                <span className="font-bold text-slate-900 tabular-nums">{metrics.flaggedStudentsCount}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Critical</span>
                <span className="font-bold text-rose-600 tabular-nums">{metrics.criticalCount}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('watchlist')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#A9E34B] hover:bg-[#94D82D] text-slate-900 text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              <span>Review watchlist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <DataSheetSyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
      />
    </>
  );
};