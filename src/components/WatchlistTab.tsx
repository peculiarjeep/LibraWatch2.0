import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { WatchlistStudent, SeverityLevel, StudentSecurityStatus } from '../types/dashboard';
import { StudentAuditModal } from './StudentAuditModal';
import { DataSheetSyncModal } from './DataSheetSyncModal';

export const WatchlistTab: React.FC = () => {
  const {
    watchlist,
    metrics,
    searchQuery,
    updateStudentStatus,
  } = useDashboard();

  const [severityFilter, setSeverityFilter] = useState<'all' | SeverityLevel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StudentSecurityStatus>('all');
  const [inspectingStudent, setInspectingStudent] = useState<WatchlistStudent | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState<boolean>(false);

  const filteredList = watchlist.filter((student) => {
    if (searchQuery.trim() && !student.studentId.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (severityFilter !== 'all' && student.severity !== severityFilter) {
      return false;
    }
    if (statusFilter !== 'all' && student.securityStatus !== statusFilter) {
      return false;
    }
    return true;
  });

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'Desktop': return <Monitor className="w-3.5 h-3.5" />;
      case 'Laptop': return <Laptop className="w-3.5 h-3.5" />;
      case 'Tablet': return <Tablet className="w-3.5 h-3.5" />;
      case 'Mobile': return <Smartphone className="w-3.5 h-3.5" />;
      default: return <Monitor className="w-3.5 h-3.5" />;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Severity', 'Failed Attempts', 'Total Attempts', 'Failure Rate', 'Status', 'Last Date', 'Last Time', 'Last Device', 'Flag Reasons'];
    const rows = filteredList.map((s) => [
      s.studentId,
      s.severity,
      s.failedAttempts,
      s.totalAttempts,
      `${s.failureRate}%`,
      s.securityStatus,
      s.lastAttempt.date,
      s.lastAttempt.timeIn,
      s.lastAttempt.device,
      `"${s.flagReasons.join('; ')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `librawatch_watchlist_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Threat Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span>
              <span className="text-xs font-bold tracking-wider uppercase text-rose-300">
                Security Surveillance Watchlist
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {metrics.flaggedStudentsCount} Flagged Suspicious Students
            </h2>
            <p className="text-xs text-rose-200/90 max-w-xl">
              Automatic rule: Flagged at <strong className="text-white">2+ failed attempts</strong> or{' '}
              <strong className="text-white">3 attempts within 10 minutes</strong>. Student{' '}
              <strong className="text-white underline decoration-rose-400">2026-9921</strong> has 13 consecutive failures
              and triggered the critical rapid-fire brute-force threshold.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSyncModalOpen(true)}
              className="px-4 py-2.5 bg-rose-500/30 hover:bg-rose-500/50 text-white rounded-xl text-xs font-bold border border-rose-400/40 flex items-center gap-2 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Add / Sync Sheet Data</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Watchlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              severityFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Severity ({watchlist.length})
          </button>
          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              severityFilter === 'critical'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>Critical ({metrics.criticalCount})</span>
          </button>
          <button
            onClick={() => setSeverityFilter('high')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              severityFilter === 'high'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>High ({metrics.highCount})</span>
          </button>
          <button
            onClick={() => setSeverityFilter('warning')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              severityFilter === 'warning'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Warning ({metrics.warningCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400"
          >
            <option value="all">All Statuses</option>
            <option value="active_watch">Active Watch</option>
            <option value="card_locked">Card Locked</option>
            <option value="whitelisted">Whitelisted</option>
          </select>
          <span className="text-xs text-slate-400 font-medium tabular-nums pl-2">
            Showing {filteredList.length} of {watchlist.length}
          </span>
        </div>
      </div>

      {/* Flagged Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((student) => {
          const isCritical = student.severity === 'critical';
          const isLocked = student.securityStatus === 'card_locked';
          const isWhitelisted = student.securityStatus === 'whitelisted';

          return (
            <div
              key={student.studentId}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between hover:shadow-md ${
                isCritical ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCritical
                          ? 'bg-rose-100 text-rose-600'
                          : student.severity === 'high'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {student.studentId}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Last attempt: {student.lastAttempt.date} at {student.lastAttempt.timeIn}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : student.severity === 'high'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {student.severity}
                    </span>
                    {isLocked && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-900 text-white flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                    {isWhitelisted && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        Whitelisted
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 my-3 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Failed</span>
                    <div className="text-lg font-black text-rose-600 tabular-nums">
                      {student.failedAttempts}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                    <div className="text-lg font-bold text-slate-800 tabular-nums">
                      {student.totalAttempts}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Failure %</span>
                    <div className="text-lg font-bold text-slate-800 tabular-nums">
                      {student.failureRate}%
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Triggered Rule:
                  </span>
                  {student.flagReasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{reason}</span>
                    </div>
                  ))}

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                    <span className="font-semibold">Devices:</span>
                    {student.devicesUsed.map((dev) => (
                      <span
                        key={dev}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px]"
                      >
                        {getDeviceIcon(dev)}
                        <span>{dev}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setInspectingStudent(student)}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Log</span>
                </button>

                {isLocked ? (
                  <button
                    onClick={() => updateStudentStatus(student.studentId, 'active_watch')}
                    title="Unlock library access"
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Unlock className="w-4 h-4 text-emerald-600" />
                  </button>
                ) : (
                  <button
                    onClick={() => updateStudentStatus(student.studentId, 'card_locked')}
                    title="Lock student card access"
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No students match current filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing the search query or changing severity filters.</p>
        </div>
      )}

      {inspectingStudent && (
        <StudentAuditModal
          student={inspectingStudent}
          onClose={() => setInspectingStudent(null)}
        />
      )}

      <DataSheetSyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
      />
    </div>
  );
};