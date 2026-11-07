import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShieldAlert,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { DayVolume } from '../types/dashboard';

export const OverviewTab: React.FC = () => {
  const { metrics, dayVolumes, deviceStats, setActiveTab } = useDashboard();
  const [hoveredDay, setHoveredDay] = useState<DayVolume | null>(null);

  const maxVolume = Math.max(...dayVolumes.map((d) => d.total), 80);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'Desktop': return <Monitor className="w-4 h-4 text-slate-500" />;
      case 'Laptop': return <Laptop className="w-4 h-4 text-slate-500" />;
      case 'Tablet': return <Tablet className="w-4 h-4 text-slate-500" />;
      case 'Mobile': return <Smartphone className="w-4 h-4 text-slate-500" />;
      default: return <Monitor className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Access monitoring overview</h2>
          <p className="text-xs text-slate-500 font-medium">
            {metrics.dateRangeText} · <span className="tabular-nums font-semibold">{metrics.totalLogins.toLocaleString()} attempts</span> from{' '}
            <span className="tabular-nums font-semibold">{metrics.uniqueStudentsCount.toLocaleString()} students</span>
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 self-start md:self-auto">
          Watchlist rule: <span className="text-slate-600 font-semibold">2+ failures</span>, or <span className="text-slate-600 font-semibold">3 attempts within 10 min</span>
        </div>
      </div>

      {/* 5 KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* TOTAL LOGINS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Total Logins</span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {metrics.totalLogins.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              {metrics.activeDays} active days
            </div>
          </div>
        </div>

        {/* SUCCESS RATE */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Success Rate</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {metrics.successRate}%
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              {metrics.successfulLogins.toLocaleString()} successful attempts
            </div>
          </div>
        </div>

        {/* FAILED ATTEMPTS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Failed Attempts</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {metrics.failedAttempts.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              {metrics.failedRate}% of all attempts
            </div>
          </div>
        </div>

        {/* FAILURE RATE 7D */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Failure Rate (7D)</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {metrics.failureRate7D}%
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
              <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded text-[11px]">
                {metrics.failureRate7DDelta >= 0 ? `+${metrics.failureRate7DDelta}%` : `${metrics.failureRate7DDelta}%`}
              </span>
              <span>vs {metrics.failureRate7DPrevious}% previous 7d</span>
            </div>
          </div>
        </div>

        {/* FLAGGED STUDENTS */}
        <div
          onClick={() => setActiveTab('watchlist')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-rose-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase group-hover:text-rose-600 transition-colors">
              Flagged Students
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-rose-100 group-hover:text-rose-700 transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {metrics.flaggedStudentsCount}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              <span className="text-rose-600 font-semibold">{metrics.criticalCount} critical</span> · {metrics.highCount} high
            </div>
          </div>
        </div>
      </div>

      {/* Login Volume By Day Stacked Bar Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Login volume by day</h3>
            <p className="text-xs text-slate-400">Successful and failed attempts recorded each day</p>
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

        {/* Chart Viewport */}
        <div className="relative pt-6">
          <div className="h-64 flex items-end gap-1.5 md:gap-2 px-2 pb-6 border-b border-slate-200 relative">
            {/* Gridlines */}
            {[0, 20, 40, 60, 80].map((val) => (
              <div
                key={val}
                className="absolute left-0 right-0 border-b border-slate-100 pointer-events-none flex items-center"
                style={{ bottom: `${(val / maxVolume) * 220 + 24}px` }}
              >
                <span className="text-[10px] text-slate-300 font-mono -ml-6">{val}</span>
              </div>
            ))}

            {dayVolumes.map((day, idx) => {
              const successH = (day.success / maxVolume) * 220;
              const failedH = (day.failed / maxVolume) * 220;
              const isHovered = hoveredDay?.date === day.date;

              return (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="flex-1 flex flex-col justify-end items-center h-full relative group cursor-pointer z-10"
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute -top-16 bg-slate-900 text-white rounded-xl py-1.5 px-3 shadow-xl text-center pointer-events-none z-30 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                      <div className="text-[11px] font-bold text-slate-200">{day.displayDate}</div>
                      <div className="text-xs font-extrabold">
                        {day.total} total · <span className="text-emerald-400">{day.success} ok</span> · <span className="text-rose-400">{day.failed} fail</span>
                      </div>
                    </div>
                  )}

                  {/* Stacked Bar */}
                  <div className={`w-full max-w-[20px] rounded-t-sm flex flex-col overflow-hidden transition-all duration-200 ${isHovered ? 'scale-x-110 opacity-90' : ''}`}>
                    <div style={{ height: `${failedH}px` }} className="bg-[#E03131] w-full" />
                    <div style={{ height: `${successH}px` }} className="bg-[#2F9E44] w-full" />
                  </div>

                  {/* Date labels */}
                  {(idx === 0 || idx === 3 || idx === 6 || idx === 9 || idx === 12 || idx === 15 || idx === 18 || idx === 21 || idx === 24 || idx === 27 || idx === dayVolumes.length - 1) && (
                    <span className="absolute -bottom-6 text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {day.shortLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Access By Device Breakdown Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Access by device</h3>
          <p className="text-xs text-slate-400">Where students are signing in from</p>
        </div>

        <div className="space-y-4 pt-2">
          {deviceStats.map((stat) => (
            <div key={stat.device} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(stat.device)}
                  <span className="font-bold text-slate-800">{stat.device}</span>
                  <span className="text-slate-400 font-medium">({stat.sharePercent}% share)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 tabular-nums">{stat.total.toLocaleString()} logins</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 font-semibold">{stat.failureRate}% failure rate</span>
                </div>
              </div>

              {/* Stacked Progress Bar */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${100 - stat.failureRate}%` }}
                  className="bg-[#51CF66] h-full"
                  title={`${stat.success} successful`}
                />
                <div
                  style={{ width: `${stat.failureRate}%` }}
                  className="bg-[#FA5252] h-full"
                  title={`${stat.failed} failed`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};