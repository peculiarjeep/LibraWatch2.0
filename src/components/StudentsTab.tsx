import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const StudentsTab: React.FC = () => {
  const { records, watchlist, searchQuery, setSearchQuery, setSelectedStudentId, setActiveTab } = useDashboard();
  const [statusFilter, setStatusFilter] = useState<'All' | 'Flagged' | 'Locked' | 'Good'>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  const studentDirectory = useMemo(() => {
    const studentMap: Record<
      string,
      {
        studentId: string;
        total: number;
        success: number;
        failed: number;
        lastDate: string;
        lastTime: string;
        lastDevice: string;
      }
    > = {};

    for (const r of records) {
      if (!studentMap[r.studentId]) {
        studentMap[r.studentId] = {
          studentId: r.studentId,
          total: 0,
          success: 0,
          failed: 0,
          lastDate: r.date,
          lastTime: r.timeIn,
          lastDevice: r.device,
        };
      }
      studentMap[r.studentId].total++;
      if (r.result === 'Success') {
        studentMap[r.studentId].success++;
      } else {
        studentMap[r.studentId].failed++;
      }
      studentMap[r.studentId].lastDate = r.date;
      studentMap[r.studentId].lastTime = r.timeIn;
      studentMap[r.studentId].lastDevice = r.device;
    }

    const watchlistIds = new Set(watchlist.map((w) => w.studentId));
    const lockedIds = new Set(watchlist.filter((w) => w.securityStatus === 'card_locked').map((w) => w.studentId));

    return Object.values(studentMap).map((s) => ({
      ...s,
      failureRate: Math.round((s.failed / s.total) * 1000) / 10,
      isFlagged: watchlistIds.has(s.studentId),
      isLocked: lockedIds.has(s.studentId),
    }));
  }, [records, watchlist]);

  const filtered = useMemo(() => {
    return studentDirectory.filter((s) => {
      if (searchQuery.trim() && !s.studentId.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter === 'Flagged' && !s.isFlagged) return false;
      if (statusFilter === 'Locked' && !s.isLocked) return false;
      if (statusFilter === 'Good' && s.isFlagged) return false;
      return true;
    });
  }, [studentDirectory, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Directory</h2>
          <p className="text-xs text-slate-500 font-medium">
            Aggregated profiles of all {studentDirectory.length.toLocaleString()} unique library users
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Flagged', 'Locked', 'Good'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st as any);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total Logins</th>
                <th className="py-3 px-4">Failures</th>
                <th className="py-3 px-4">Failure Rate</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((student) => (
                <tr key={student.studentId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {student.studentId}
                  </td>
                  <td className="py-3 px-4">
                    {student.isLocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    ) : student.isFlagged ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        <ShieldAlert className="w-3 h-3" /> Flagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Normal
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 tabular-nums">
                    {student.total}
                  </td>
                  <td className="py-3 px-4 font-semibold text-rose-600 tabular-nums">
                    {student.failed}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 tabular-nums">
                    {student.failureRate}%
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {student.lastDate} · {student.lastTime}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {student.isFlagged ? (
                      <button
                        onClick={() => {
                          setSelectedStudentId(student.studentId);
                          setActiveTab('watchlist');
                        }}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Watchlist</span>
                      </button>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50">
          <div>
            Showing <span className="font-bold text-slate-900">{filtered.length}</span> students
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
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