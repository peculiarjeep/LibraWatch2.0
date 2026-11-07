import React, { useState } from 'react';
import {
  Maximize2,
  Minimize2,
  Layers,
  FileSpreadsheet,
  Camera,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

interface RightDockToolbarProps {
  onOpenSync: () => void;
}

export const RightDockToolbar: React.FC<RightDockToolbarProps> = ({ onOpenSync }) => {
  const { setActiveTab } = useDashboard();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [screenshotSuccess, setScreenshotSuccess] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleCapture = () => {
    setScreenshotSuccess(true);
    setTimeout(() => setScreenshotSuccess(false), 2000);
    window.print();
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-slate-200 border-r-0 rounded-l-xl p-2 shadow-md text-slate-500 hover:text-slate-900"
        title="Open Tools Dock"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    );
  }

  return (
    <aside className="fixed right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-lg">
      <button
        onClick={toggleFullscreen}
        className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      <button
        onClick={() => setActiveTab('analytics')}
        className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="View Telemetry Layers & Analytics"
      >
        <Layers className="w-4 h-4" />
      </button>

      <button
        onClick={onOpenSync}
        className="p-2.5 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
        title="DataSheet Sync & Row Ingestion"
      >
        <FileSpreadsheet className="w-4 h-4" />
      </button>

      <button
        onClick={() => setActiveTab('watchlist')}
        className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
        title="Quick Jump to Watchlist"
      >
        <ShieldAlert className="w-4 h-4" />
      </button>

      <button
        onClick={handleCapture}
        className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
        title="Print / Save Dashboard Snapshot"
      >
        <Camera className="w-4 h-4" />
        {screenshotSuccess && (
          <span className="absolute -left-16 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
            Printing!
          </span>
        )}
      </button>

      <button
        onClick={() => setIsCollapsed(true)}
        className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        title="Collapse Dock"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </aside>
  );
};