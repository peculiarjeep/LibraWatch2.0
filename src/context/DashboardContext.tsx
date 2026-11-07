import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  LoginRecord,
  DashboardMetrics,
  DayVolume,
  DeviceStat,
  WatchlistStudent,
  StudentSecurityStatus,
} from '../types/dashboard';
import {
  calculateMetrics,
  calculateDayVolumes,
  calculateDeviceStats,
  buildWatchlist,
  parseCSVToRecords,
} from '../utils/dashboardCalculations';

const INITIAL_LOG_RECORDS: LoginRecord[] = [];

export type TabKey = 'overview' | 'login-log' | 'students' | 'watchlist' | 'analytics' | 'settings';

interface DashboardContextType {
  records: LoginRecord[];
  metrics: DashboardMetrics;
  dayVolumes: DayVolume[];
  deviceStats: DeviceStat[];
  watchlist: WatchlistStudent[];
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedStudent: WatchlistStudent | null;
  setSelectedStudentId: (id: string | null) => void;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  lastModifiedTimestamp: number | null;
  pollError: string | null;
  pollNow: () => Promise<void>;
  appendSheetRows: (newRowsCSV: string) => Promise<{ success: boolean; error?: string }>;
  syncFromCSV: (fullCSV: string) => Promise<{ success: boolean; error?: string }>;
  syncFromGoogleSheetUrl: (url: string) => Promise<{ success: boolean; count?: number; error?: string }>;
  resetToInitialData: () => Promise<void>;
  studentOverrides: Record<string, StudentSecurityStatus>;
  updateStudentStatus: (studentId: string, status: StudentSecurityStatus) => void;
  incidentNotes: Record<string, string>;
  setIncidentNote: (studentId: string, note: string) => void;
  isSettingsUnlocked: boolean;
  settingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  unlockSettings: (password: string) => boolean;
  lockSettings: () => void;
  recentToasts: Array<{ id: string; title: string; message: string; type: 'info' | 'warning' | 'critical' }>;
  dismissToast: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Live Published Google Sheet CSV URL (with public CORS access)
const LIVE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS5irLIO4XFmCmhox8g73N_V8sTjzFwyWDU6EcT0It-TrFQcaUULs-8tFDVz4B-Jr2Rrsh4q-gGVdcp/pub?gid=1870945839&single=true&output=csv';

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<LoginRecord[]>(() => {
    try {
      const saved = localStorage.getItem('librawatch_stored_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_LOG_RECORDS;
  });

  const [activeTab, setActiveTabState] = useState<TabKey>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentOverrides, setStudentOverrides] = useState<Record<string, StudentSecurityStatus>>({
    '2026-9921': 'active_watch',
  });
  const [incidentNotes, setIncidentNotes] = useState<Record<string, string>>({
    '2026-9921': 'Subject detected submitting multiple rapid incorrect passwords on Desktop kiosk 04.',
  });

  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [lastModifiedTimestamp, setLastModifiedTimestamp] = useState<number | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [recentToasts, setRecentToasts] = useState<
    Array<{ id: string; title: string; message: string; type: 'info' | 'warning' | 'critical' }>
  >([]);

  const hasRecordChanges = useCallback((nextRecords: LoginRecord[], previousRecords: LoginRecord[]) => {
    if (nextRecords.length !== previousRecords.length) {
      return true;
    }

    return nextRecords.some((record, index) => JSON.stringify(record) !== JSON.stringify(previousRecords[index]));
  }, []);

  const metrics = useMemo(() => calculateMetrics(records, studentOverrides), [records, studentOverrides]);
  const dayVolumes = useMemo(() => calculateDayVolumes(records), [records]);
  const deviceStats = useMemo(() => calculateDeviceStats(records), [records]);
  const watchlist = useMemo(
    () => buildWatchlist(records, studentOverrides, incidentNotes),
    [records, studentOverrides, incidentNotes]
  );

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return watchlist.find((w) => w.studentId === selectedStudentId) || null;
  }, [watchlist, selectedStudentId]);

  const addToast = useCallback((title: string, message: string, type: 'info' | 'warning' | 'critical') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setRecentToasts((prev) => [{ id, title, message, type }, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setRecentToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setRecentToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setActiveTab = useCallback(
    (tab: TabKey) => {
      if (tab === 'settings' && !isSettingsUnlocked) {
        setSettingsModalOpen(true);
      } else {
        setActiveTabState(tab);
      }
    },
    [isSettingsUnlocked]
  );

  const unlockSettings = useCallback((password: string): boolean => {
    if (password === 'Peculiarjeep') {
      setIsSettingsUnlocked(true);
      setSettingsModalOpen(false);
      setActiveTabState('settings');
      return true;
    }
    return false;
  }, []);

  const lockSettings = useCallback(() => {
    setIsSettingsUnlocked(false);
    if (activeTab === 'settings') {
      setActiveTabState('overview');
    }
  }, [activeTab]);

  const openSettingsModal = useCallback(() => setSettingsModalOpen(true), []);
  const closeSettingsModal = useCallback(() => setSettingsModalOpen(false), []);

  const updateStudentStatus = useCallback((studentId: string, status: StudentSecurityStatus) => {
    setStudentOverrides((prev) => ({ ...prev, [studentId]: status }));
  }, []);

  const setIncidentNote = useCallback((studentId: string, note: string) => {
    setIncidentNotes((prev) => ({ ...prev, [studentId]: note }));
  }, []);

  // Poll live published Google Sheet CSV every 5 seconds
  const pollNow = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await fetch(`${LIVE_SHEET_URL}&t=${Date.now()}`);
      if (res.ok) {
        const csvText = await res.text();
        const parsed = parseCSVToRecords(csvText);

        if (parsed.length > 0) {
          let didUpdate = false;
          let previousLength = 0;

          setRecords((prevRecords) => {
            previousLength = prevRecords.length;
            if (!hasRecordChanges(parsed, prevRecords)) {
              return prevRecords;
            }

            didUpdate = true;
            try {
              localStorage.setItem('librawatch_stored_records', JSON.stringify(parsed));
            } catch {}
            return parsed;
          });

          if (didUpdate) {
            const delta = parsed.length - previousLength;
            setLastModifiedTimestamp(Date.now());
            addToast(
              'Live Google Sheet Synced',
              `Fetched ${parsed.length} total records (${delta > 0 ? `+${delta}` : delta} new).`,
              'info'
            );
          }
        }
      }
      setLastSyncTime(new Date());
      setPollError(null);
    } catch (err: any) {
      setPollError(err.message || 'Live Google Sheet polling error');
    } finally {
      setIsSyncing(false);
    }
  }, [addToast, hasRecordChanges]);

  const appendSheetRows = useCallback(
    async (newRowsCSV: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setIsSyncing(true);
        const header = 'Student-ID,Login Date,Login Result,Device Type,Time in,Time out\n';
        const parsed = parseCSVToRecords(header + newRowsCSV);
        if (parsed.length === 0) {
          throw new Error('No valid rows parsed.');
        }

        let didUpdate = false;
        setRecords((prev) => {
          const updated = [...prev, ...parsed];
          if (hasRecordChanges(updated, prev)) {
            didUpdate = true;
            try {
              localStorage.setItem('librawatch_stored_records', JSON.stringify(updated));
            } catch {}
            return updated;
          }
          return prev;
        });

        if (didUpdate) {
          setLastModifiedTimestamp(Date.now());
          addToast('Data Appended', `Added ${parsed.length} row(s) to dashboard.`, 'info');
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      } finally {
        setIsSyncing(false);
      }
    },
    [addToast, hasRecordChanges]
  );

  const syncFromCSV = useCallback(
    async (fullCSV: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setIsSyncing(true);
        const parsed = parseCSVToRecords(fullCSV);
        if (parsed.length === 0) {
          throw new Error('No valid records found.');
        }

        let didUpdate = false;
        setRecords((prev) => {
          if (!hasRecordChanges(parsed, prev)) {
            return prev;
          }
          didUpdate = true;
          try {
            localStorage.setItem('librawatch_stored_records', JSON.stringify(parsed));
          } catch {}
          return parsed;
        });

        if (didUpdate) {
          setLastModifiedTimestamp(Date.now());
          addToast('DataSheet Synced', `Loaded ${parsed.length} records.`, 'info');
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      } finally {
        setIsSyncing(false);
      }
    },
    [addToast, hasRecordChanges]
  );

  const syncFromGoogleSheetUrl = useCallback(
    async (url: string): Promise<{ success: boolean; count?: number; error?: string }> => {
      try {
        setIsSyncing(true);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Google Sheets responded with status ${res.status}`);
        }
        const csvText = await res.text();
        const parsed = parseCSVToRecords(csvText);
        if (parsed.length === 0) {
          throw new Error('No valid rows found in Google Sheet URL');
        }

        await syncFromCSV(csvText);
        return { success: true, count: parsed.length };
      } catch (err: any) {
        return { success: false, error: err.message };
      } finally {
        setIsSyncing(false);
      }
    },
    [syncFromCSV]
  );

  const resetToInitialData = useCallback(async () => {
    try {
      localStorage.removeItem('librawatch_stored_records');
    } catch {}

    setRecords((prev) => {
      if (!hasRecordChanges(INITIAL_LOG_RECORDS, prev)) {
        return prev;
      }
      return INITIAL_LOG_RECORDS;
    });

    setLastModifiedTimestamp(Date.now());
    addToast('Data Reloaded', 'Re-synchronized dashboard with initial dataset.', 'info');
  }, [addToast, hasRecordChanges]);

  useEffect(() => {
    pollNow();
    const interval = setInterval(() => {
      pollNow();
    }, 5000);
    return () => clearInterval(interval);
  }, [pollNow]);

  return (
    <DashboardContext.Provider
      value={{
        records,
        metrics,
        dayVolumes,
        deviceStats,
        watchlist,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedStudent,
        setSelectedStudentId,
        isSyncing,
        lastSyncTime,
        lastModifiedTimestamp,
        pollError,
        pollNow,
        appendSheetRows,
        syncFromCSV,
        syncFromGoogleSheetUrl,
        resetToInitialData,
        studentOverrides,
        updateStudentStatus,
        incidentNotes,
        setIncidentNote,
        isSettingsUnlocked,
        settingsModalOpen,
        openSettingsModal,
        closeSettingsModal,
        unlockSettings,
        lockSettings,
        recentToasts,
        dismissToast,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}