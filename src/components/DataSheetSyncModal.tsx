import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Link,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { parseCSVToRecords } from '../utils/dashboardCalculations';

interface DataSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSheetSyncModal: React.FC<DataSheetSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    records,
    pollNow,
    appendSheetRows,
    syncFromCSV,
    syncFromGoogleSheetUrl,
    isSyncing,
    lastSyncTime,
  } = useDashboard();

  const [activeMode, setActiveMode] = useState<'paste' | 'url' | 'upload'>('paste');
  const [pasteRowsText, setPasteRowsText] = useState<string>('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAppendRows = async () => {
    if (!pasteRowsText.trim()) {
      setStatusMessage({ text: 'Please paste at least one row of data.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await appendSheetRows(pasteRowsText);
    setIsSubmitting(false);

    if (res.success) {
      setStatusMessage({ text: 'New data successfully appended to DataSheet! Dashboard updated.', type: 'success' });
      setPasteRowsText('');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMessage({ text: res.error || 'Failed to append data.', type: 'error' });
    }
  };

  const handleSyncUrl = async () => {
    if (!googleSheetUrl.trim()) {
      setStatusMessage({ text: 'Please enter a valid Google Sheet CSV or Publish URL.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await syncFromGoogleSheetUrl(googleSheetUrl);
    setIsSubmitting(false);

    if (res.success) {
      setStatusMessage({ text: `Synced ${res.count} records directly from Google Sheet!`, type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMessage({ text: res.error || 'Could not fetch from that URL.', type: 'error' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setIsSubmitting(true);
        const res = await syncFromCSV(content);
        setIsSubmitting(false);
        if (res.success) {
          setStatusMessage({ text: 'Uploaded CSV synced with DataSheet successfully!', type: 'success' });
          setTimeout(() => onClose(), 1200);
        } else {
          setStatusMessage({ text: res.error || 'Failed to sync CSV', type: 'error' });
        }
      }
    };
    reader.readAsText(file);
  };

  const parsedPreviewCount = pasteRowsText.trim()
    ? parseCSVToRecords('Student-ID,Login Date,Login Result,Device Type,Time in,Time out\n' + pasteRowsText).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">DataSheet Sync & Row Ingestion</h3>
              <p className="text-[11px] text-slate-400">
                Continuous monitor active · Currently showing{' '}
                <strong className="text-slate-700">{records.length.toLocaleString()} rows</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <button
            onClick={() => {
              setActiveMode('paste');
              setStatusMessage(null);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeMode === 'paste'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Paste Sheet Rows</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('url');
              setStatusMessage(null);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeMode === 'url'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Google Sheet URL</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('upload');
              setStatusMessage(null);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeMode === 'upload'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeMode === 'paste' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Paste New Google Sheet Rows (Comma-separated)
                </label>
                {parsedPreviewCount > 0 && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {parsedPreviewCount} valid new row{parsedPreviewCount > 1 ? 's' : ''} detected
                  </span>
                )}
              </div>
              <textarea
                value={pasteRowsText}
                onChange={(e) => setPasteRowsText(e.target.value)}
                placeholder={`Example row format:\n2026-9921,2026-10-26,Failed,Desktop,08:30,\n2026-4412,2026-10-26,Success,Laptop,08:45,11:30`}
                className="w-full h-32 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-400 focus:bg-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                You can copy multiple rows from Google Sheets or Excel and paste them here to update the dashboard.
              </p>
            </div>
          )}

          {activeMode === 'url' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Google Sheet Published CSV Link</label>
              <input
                type="url"
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-400 focus:bg-white focus:outline-none"
              />
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                <strong>How to get this:</strong> In Google Sheets &rarr; File &rarr; Share &rarr; Publish to web &rarr; Choose <em>CSV</em> &rarr; Copy link.
              </div>
            </div>
          )}

          {activeMode === 'upload' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Upload Exported Sheet CSV File</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 mb-1">Select your DataSheet CSV</p>
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileUpload}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Continuous Sheet Monitor: <strong>Active</strong></span>
            </div>
            <button
              onClick={() => pollNow()}
              disabled={isSyncing}
              className="text-indigo-600 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Check Sheet Now</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Last checked: {lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Just now'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
            {activeMode === 'paste' && (
              <button
                onClick={handleAppendRows}
                disabled={isSubmitting || !pasteRowsText.trim()}
                className="px-5 py-2 bg-[#3B5BDB] hover:bg-[#364FC7] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                {isSubmitting ? 'Appending...' : 'Append to DataSheet'}
              </button>
            )}
            {activeMode === 'url' && (
              <button
                onClick={handleSyncUrl}
                disabled={isSubmitting || !googleSheetUrl.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                {isSubmitting ? 'Fetching...' : 'Sync from URL'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};