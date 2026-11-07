import React, { useMemo } from 'react';
import {
  Clock,
  TrendingDown,
  Monitor,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const AnalyticsTab: React.FC = () => {
  const { records, deviceStats, metrics } = useDashboard();

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${String(i).padStart(2, '0')}:00`,
      success: 0,
      failed: 0,
      total: 0,
    }));

    for (const r of records) {
      const hr = parseInt(r.timeIn.split(':')[0], 10);
      if (!isNaN(hr) && hr >= 0 && hr < 24) {
        hours[hr].total++;
        if (r.result === 'Success') {
          hours[hr].success++;
        } else {
          hours[hr].failed++;
        }
      }
    }

    return hours;
  }, [records]);

  const maxHourVolume = Math.max(...hourlyData.map((h) => h.total), 1);

  const peakHour = useMemo(() => {
    return [...hourlyData].sort((a, b) => b.total - a.total)[0];
  }, [hourlyData]);

  const highRiskHour = useMemo(() => {
    return [...hourlyData]
      .filter((h) => h.total >= 10)
      .sort((a, b) => b.failed / (b.total || 1) - a.failed / (a.total || 1))[0];
  }, [hourlyData]);

  return (
    <div className="space-y-6 pb-12">
      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Peak Access Hour</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {peakHour?.label || '—'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {peakHour?.total} logins recorded at this time
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <TrendingDown className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Highest Risk Window</span>
          </div>
          <div className="text-2xl font-black text-rose-600">
            {highRiskHour?.label || '—'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {highRiskHour ? `${Math.round((highRiskHour.failed / highRiskHour.total) * 100)}% failure rate` : '—'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Telemetry Range</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.activeDays} Days
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {metrics.dateRangeText}
          </p>
        </div>
      </div>

      {/* Hourly Traffic Curve */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">24-Hour Traffic Curve</h3>
            <p className="text-xs text-slate-400">Distribution of logins across kiosk operating hours</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F9E44]"></span>
              <span className="text-slate-600">Success</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E03131]"></span>
              <span className="text-slate-600">Failed</span>
            </div>
          </div>
        </div>

        <div className="h-60 flex items-end gap-1 pt-6 px-2 pb-6 border-b border-slate-100 relative">
          {hourlyData.map((h) => {
            const successH = (h.success / maxHourVolume) * 180;
            const failedH = (h.failed / maxHourVolume) * 180;
            return (
              <div
                key={h.hour}
                className="flex-1 flex flex-col justify-end items-center h-full relative group cursor-pointer"
              >
                <div className="w-full max-w-[14px] rounded-t-sm flex flex-col overflow-hidden">
                  <div style={{ height: `${failedH}px` }} className="bg-[#E03131] w-full" />
                  <div style={{ height: `${successH}px` }} className="bg-[#2F9E44] w-full" />
                </div>
                <span className="text-[9px] text-slate-400 mt-2 font-mono">
                  {h.hour % 3 === 0 ? `${h.hour}h` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};