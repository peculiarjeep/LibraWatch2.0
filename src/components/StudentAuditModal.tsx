import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  Save,
} from 'lucide-react';
import { WatchlistStudent, StudentSecurityStatus } from '../types/dashboard';
import { useDashboard } from '../context/DashboardContext';

interface StudentAuditModalProps {
  student: WatchlistStudent | null;
  onClose: () => void;
}

export const StudentAuditModal: React.FC<StudentAuditModalProps> = ({ student, onClose }) => {
  const { updateStudentStatus, setIncidentNote } = useDashboard();
  const [noteText, setNoteText] = useState<string>(student?.incidentNotes || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!student) return null;

  const handleStatusChange = (status: StudentSecurityStatus) => {
    updateStudentStatus(student.studentId, status);
  };

  const handleSaveNote = () => {
    setIncidentNote(student.studentId, noteText);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'Desktop': return <Monitor className="w-3.5 h-3.5" />;
      case 'Laptop': return <Laptop className="w-3.5 h-3.5" />;
      case 'Tablet': return <Tablet className="w-3.5 h-3.5" />;
      case 'Mobile': return <Smartphone className="w-3.5 h-3.5" />;
      default: return <Monitor className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                student.severity === 'critical'
                  ? 'bg-rose-100 text-rose-600'
                  : student.severity === 'high'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">Student {student.studentId}</h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    student.severity === 'critical'
                      ? 'bg-rose-100 text-rose-700'
                      : student.severity === 'high'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {student.severity} threat
                </span>
                {student.securityStatus === 'card_locked' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Authentication history & security incident audit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Failed Logins</span>
              <div className="text-xl font-bold text-rose-600 tabular-nums">{student.failedAttempts}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Logins</span>
              <div className="text-xl font-bold text-slate-800 tabular-nums">{student.totalAttempts}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Failure Rate</span>
              <div className="text-xl font-bold text-slate-800 tabular-nums">{student.failureRate}%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Devices Used</span>
              <div className="text-sm font-bold text-slate-800 mt-1">{student.devicesUsed.join(', ')}</div>
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3.5 space-y-1">
            <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Flag Trigger Reason</span>
            </div>
            <ul className="text-xs text-rose-800 pl-5 list-disc space-y-0.5">
              {student.flagReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900">Security Access Controls</div>
              <div className="text-[11px] text-slate-500">Apply administrative override to this student account</div>
            </div>

            <div className="flex items-center gap-2">
              {student.securityStatus === 'card_locked' ? (
                <button
                  onClick={() => handleStatusChange('active_watch')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 shadow-2xs"
                >
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unlock Card</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange('card_locked')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 flex items-center gap-1.5 shadow-2xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Library Access</span>
                </button>
              )}

              {student.securityStatus === 'whitelisted' ? (
                <button
                  onClick={() => handleStatusChange('active_watch')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Remove Whitelist
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange('whitelisted')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Whitelisted</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900">Incident & Investigation Notes</label>
              {savedSuccess && <span className="text-xs font-semibold text-emerald-600">Saved!</span>}
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record notes on student explanation, verification checks, or kiosk tampering..."
              className="w-full h-20 p-3 text-xs bg-white border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNote}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Notes</span>
              </button>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900">Full Attempt Audit Log ({student.logs.length} events)</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">Device</th>
                    <th className="py-2 px-3">Duration</th>
                    <th className="py-2 px-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {student.logs.map((log) => (
                    <tr
                      key={log.id}
                      className={log.result === 'Failed' ? 'bg-rose-50/30' : 'hover:bg-slate-50'}
                    >
                      <td className="py-2 px-3 font-medium text-slate-700">{log.date}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{log.timeIn}</td>
                      <td className="py-2 px-3 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          {getDeviceIcon(log.device)}
                          <span>{log.device}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {log.timeOut ? `${log.timeIn} - ${log.timeOut}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.result === 'Success'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {log.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="text-xs text-slate-400">Library Security Surveillance Record</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};