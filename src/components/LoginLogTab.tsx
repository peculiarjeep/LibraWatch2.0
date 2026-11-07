import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { DeviceType, LoginResult } from '../types/dashboard';

export const LoginLogTab: React.FC = () => {
  const { records, searchQuery, setSearchQuery } = useDashboard();

  const [resultFilter, setResultFilter] = useState<'All' | LoginResult>('All');
  const [deviceFilter, setDeviceFilter] = useState<'All' | DeviceType>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const filteredRecords = useMemo(() => {
    return records
      .slice()
      .reverse()
      .filter((rec) => {
        if (searchQuery.trim() && !rec.studentId.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        if (resultFilter !== 'All' && rec.result !== resultFilter) {
          return false;
        }
        if (deviceFilter !== 'All' && rec.device !== deviceFilter) {
          return false;
        }
        return true;
      });
  }, [records, searchQuery, resultFilter, deviceFilter]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleExportCSV = () => {
    const headers = ['Record ID', 'Student ID', 'Date', 'Time In', 'Time Out', 'Device Type', 'Login Result'];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.studentId,
      r.date,
      r.timeIn,
      r.timeOut || '',
      r.device,
      r.result,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `librawatch_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDeviceIcon = (device: DeviceType) => {
    switch (device) {
      case 'Desktop': return <Monitor className="w-3.5 h-3.5" />;
      case 'Laptop': return <Laptop className="w-3.5 h-3.5" />;
      case 'Tablet': return <Tablet className="w-3.5 h-3.5" />;
      case 'Mobile': return <Smartphone className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Full Authentication Log</h2>
          <p className="text-xs text-slate-500 font-medium">
            Complete raw login records from library entry kiosks (passwords hidden per privacy guidelines)
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-2xs self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Result:</span>
            <select
              value={resultFilter}
              onChange={(e) => {
                setResultFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="All">All Results</option>
              <option value="Success">Success Only</option>
              <option value="Failed">Failed Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Device:</span>
            <select
              value={deviceFilter}
              onChange={(e) => {
                setDeviceFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="All">All Devices</option>
              <option value="Desktop">Desktop</option>
              <option value="Laptop">Laptop</option>
              <option value="Tablet">Tablet</option>
              <option value="Mobile">Mobile</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 tabular-nums">
            Showing {filteredRecords.length.toLocaleString()} matching records
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-700"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time In</th>
                <th className="py-3 px-4">Time Out</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.map((rec) => {
                const isFail = rec.result === 'Failed';
                return (
                  <tr
                    key={rec.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isFail ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {rec.studentId}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{rec.date}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{rec.timeIn}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{rec.timeOut || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        {getDeviceIcon(rec.device)}
                        <span>{rec.device}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isFail
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isFail ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        <span>{rec.result}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50">
          <div>
            Page <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
            <span className="font-bold text-slate-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};