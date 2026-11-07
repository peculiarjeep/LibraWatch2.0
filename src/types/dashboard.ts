export type LoginResult = 'Success' | 'Failed';
export type DeviceType = 'Desktop' | 'Tablet' | 'Mobile' | 'Laptop';

export interface LoginRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  result: LoginResult;
  device: DeviceType;
  timeIn: string; // HH:mm
  timeOut?: string;
  isLive?: boolean;
}

export type SeverityLevel = 'critical' | 'high' | 'warning';
export type StudentSecurityStatus = 'active_watch' | 'card_locked' | 'whitelisted' | 'normal';

export interface WatchlistStudent {
  studentId: string;
  failedAttempts: number;
  totalAttempts: number;
  successAttempts: number;
  failureRate: number;
  lastAttempt: {
    date: string;
    timeIn: string;
    result: LoginResult;
    device: DeviceType;
  };
  flagReasons: string[];
  severity: SeverityLevel;
  rapidAttempts: boolean;
  securityStatus: StudentSecurityStatus;
  incidentNotes?: string;
  devicesUsed: DeviceType[];
  logs: LoginRecord[];
}

export interface DeviceStat {
  device: DeviceType;
  total: number;
  failed: number;
  success: number;
  failureRate: number;
  sharePercent: number;
}

export interface DayVolume {
  date: string;
  displayDate: string;
  shortLabel: string;
  success: number;
  failed: number;
  total: number;
  failureRate: number;
}

export interface DashboardMetrics {
  totalLogins: number;
  activeDays: number;
  successRate: number;
  successfulLogins: number;
  failedAttempts: number;
  failedRate: number;
  failureRate7D: number;
  failureRate7DPrevious: number;
  failureRate7DDelta: number;
  flaggedStudentsCount: number;
  criticalCount: number;
  highCount: number;
  warningCount: number;
  uniqueStudentsCount: number;
  dateRangeText: string;
}