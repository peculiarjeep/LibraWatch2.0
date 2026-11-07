import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const SettingsPasswordModal: React.FC = () => {
  const { settingsModalOpen, closeSettingsModal, unlockSettings } = useDashboard();
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!settingsModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the security passkey.');
      return;
    }

    const success = unlockSettings(password);
    if (success) {
      setIsSuccess(true);
      setError('');
      setTimeout(() => {
        setIsSuccess(false);
        setPassword('');
      }, 500);
    } else {
      setError('Incorrect passkey. Access denied.');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={closeSettingsModal}
            className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold">Administrator Authentication</h3>
          <p className="text-xs text-slate-400 mt-1">
            Access to security settings and surveillance controls requires passkey verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin Passkey</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password..."
                autoFocus
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:bg-white focus:outline-none pr-10 font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {isSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Passkey accepted. Unlocking settings...</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeSettingsModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#3B5BDB] hover:bg-[#364FC7] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98"
            >
              Unlock Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};