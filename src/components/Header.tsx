import React, { useState } from 'react';
import { Search, RotateCw, Plus } from 'lucide-react';
import { useDashboard, TabKey } from '../context/DashboardContext';
import { DataSheetSyncModal } from './DataSheetSyncModal';

export const Header: React.FC = () => {
  const {
    activeTab,
    metrics,
    searchQuery,
    setSearchQuery,
    pollNow,
    isSyncing,
  } = useDashboard();

  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  const getTabTitle = (tab: TabKey): string => {
    switch (tab) {
      case 'overview': return 'Overview';
      case 'login-log': return 'Login Log';
      case 'students': return 'Student Directory';
      case 'watchlist': return 'Suspicious Activity Watchlist';
      case 'analytics': return 'Analytics & Telemetry';
      case 'settings': return 'System & Security Settings';
      default: return 'Overview';
    }
  };

  return (
    <>
      <header className="h-18 px-8 bg-white border-b border-slate-200 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {getTabTitle(activeTab)}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-64 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student ID..."
              className="w-full pl-9 pr-4 py-2 bg-[#F1F3F5] text-slate-800 placeholder-slate-400 text-xs md:text-sm rounded-xl border border-transparent focus:border-indigo-400 focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

          {/* Continuous Sheet Sync Badge */}
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center gap-2 bg-[#EBFBEE] hover:bg-[#D3F9D8] text-[#2B8A3E] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#D3F9D8] whitespace-nowrap shadow-xs transition-colors cursor-pointer group"
            title="Continuously monitoring DataSheet · Click to manage sync or paste new rows"
          >
            <span className="w-2 h-2 rounded-full bg-[#40C057] animate-pulse"></span>
            <span className="tabular-nums font-bold">
              {metrics.totalLogins.toLocaleString()} DataSheet records
            </span>
            <span className="text-slate-400 font-normal">·</span>
            <span className="text-slate-500 font-medium group-hover:text-emerald-800">
              {isSyncing ? 'checking sheet...' : 'live monitored'}
            </span>
          </button>

          {/* Add / Paste New Sheet Data Button */}
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#3B5BDB] hover:bg-[#364FC7] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sheet Data</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={() => pollNow()}
            disabled={isSyncing}
            title="Check DataSheet for new rows"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#5C7CFA] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              SO
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">Security Ops</div>
              <div className="text-[11px] text-slate-400 font-medium">Library systems</div>
            </div>
          </div>
        </div>
      </header>

      <DataSheetSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </>
  );
};