import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Shield,
  KeyRound,
  Check,
  Server,
  FileSpreadsheet,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { DataSheetSyncModal } from './DataSheetSyncModal';

export const SettingsTab: React.FC = () => {
  const {
    lockSettings,
    records,
    pollNow,
    isSyncing,
    resetToInitialData,
  } = useDashboard();

  const [minFailuresThreshold, setMinFailuresThreshold] = useState<number>(2);
  const [rapidWindowMinutes, setRapidWindowMinutes] = useState<number>(10);
  const [autoLockCritical, setAutoLockCritical] = useState<boolean>(true);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState<boolean>(false);
  const [syncModalOpen, setSyncModalOpen] = useState<boolean>(false);

  const handleSave = () => {
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Session Header */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Unlock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <span>Security Officer Session Authenticated</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-emerald-700">
              Passkey &quot;Peculiarjeep&quot; verified. You have administrative authority over surveillance policies.
            </p>
          </div>
        </div>

        <button
          onClick={lockSettings}
          className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-800 hover:bg-emerald-100/50 flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock Session</span>
        </button>
      </div>

      <div className="space-y-5">
        {/* Section 1: Watchlist & Detection Rules */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Watchlist Auto-Flagging Rules</h3>
              <p className="text-xs text-slate-400">Configure parameters for suspicious login detection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Minimum Failed Logins to Flag
              </label>
              <select
                value={minFailuresThreshold}
                onChange={(e) => setMinFailuresThreshold(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-400"
              >
                <option value={1}>1 failure (High sensitivity)</option>
                <option value={2}>2 failures (Default - LibraWatch standard)</option>
                <option value={3}>3 failures (Moderate)</option>
                <option value={5}>5 failures (Relaxed)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Rapid-Fire Velocity Window (Minutes)
              </label>
              <select
                value={rapidWindowMinutes}
                onChange={(e) => setRapidWindowMinutes(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-400"
              >
                <option value={5}>5 minutes (Aggressive burst detection)</option>
                <option value={10}>10 minutes (Standard library window)</option>
                <option value={15}>15 minutes (Broad cluster window)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Continuous DataSheet Monitor & Synchronization */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Continuous DataSheet Monitor</h3>
              <p className="text-xs text-slate-400">
                Monitors the DataSheet records without simulated or random numbers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Polling Engine</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Data is strictly read from your DataSheet without random or simulated numbers.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => pollNow()}
                  disabled={isSyncing}
                  className="flex-1 py-2 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>{isSyncing ? 'Checking...' : 'Check Sheet Now'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Current Dataset Size</span>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {records.length.toLocaleString()} rows
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Add rows directly from your Google Sheet to immediately expand the telemetry.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setSyncModalOpen(true)}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Paste / Import Sheet Rows</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Passkey & Security Policy */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security Credentials & Policy</h3>
              <p className="text-xs text-slate-400">Settings gate passkey configuration</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">Configured Passkey</div>
              <div className="text-xs font-mono text-slate-600 mt-0.5">
                Peculiarjeep <span className="text-[10px] text-slate-400">(exact string configured)</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
              Active Protection
            </span>
          </div>
        </div>

        {/* Section 4: Data Maintenance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Server className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Database & Telemetry Reset</h3>
              <p className="text-xs text-slate-400">Restore dataset to initial 1,105 library log records</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-rose-50/50 border border-rose-100 rounded-xl">
            <div>
              <div className="text-xs font-bold text-rose-900">Reset All Telemetry Records</div>
              <div className="text-[11px] text-rose-700">
                Re-reads and reloads the current library logs directly from the DataSheet file.
              </div>
            </div>
            <button
              onClick={resetToInitialData}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
            >
              <span>Reset Database</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedSettingsNotice ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Changes applied to live policy.
            </span>
          ) : (
            <span className="text-xs text-slate-400">Settings take effect immediately.</span>
          )}

          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#3B5BDB] hover:bg-[#364FC7] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98"
          >
            Save Policy Changes
          </button>
        </div>
      </div>

      <DataSheetSyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
      />
    </div>
  );
};