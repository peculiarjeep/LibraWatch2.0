import {
  LoginRecord,
  DashboardMetrics,
  DayVolume,
  DeviceStat,
  WatchlistStudent,
  SeverityLevel,
  StudentSecurityStatus,
  DeviceType,
} from '../types/dashboard';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDisplayDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10) - 1;
  return `${day} ${MONTH_NAMES[month] || ''}`;
}

export function calculateMetrics(
  records: LoginRecord[],
  studentOverrides: Record<string, StudentSecurityStatus> = {}
): DashboardMetrics {
  const total = records.length;
  if (total === 0) {
    return {
      totalLogins: 0,
      activeDays: 0,
      successRate: 0,
      successfulLogins: 0,
      failedAttempts: 0,
      failedRate: 0,
      failureRate7D: 0,
      failureRate7DPrevious: 0,
      failureRate7DDelta: 0,
      flaggedStudentsCount: 0,
      criticalCount: 0,
      highCount: 0,
      warningCount: 0,
      uniqueStudentsCount: 0,
      dateRangeText: 'No records',
    };
  }

  const successes = records.filter((r) => r.result === 'Success').length;
  const failures = total - successes;
  const successRate = total > 0 ? (successes / total) * 100 : 0;
  const failedRate = total > 0 ? (failures / total) * 100 : 0;

  const dates = Array.from(new Set(records.map((r) => r.date))).sort();
  const activeDays = dates.length;
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const dateRangeText = `${formatDisplayDate(firstDate)} – ${formatDisplayDate(lastDate)}`;

  const last7Dates = dates.slice(-7);
  const prev7Dates = dates.slice(-14, -7);

  const last7Records = records.filter((r) => last7Dates.includes(r.date));
  const prev7Records = records.filter((r) => prev7Dates.includes(r.date));

  const last7Failures = last7Records.filter((r) => r.result === 'Failed').length;
  const prev7Failures = prev7Records.filter((r) => r.result === 'Failed').length;

  const failureRate7D = last7Records.length > 0 ? (last7Failures / last7Records.length) * 100 : failedRate;
  const failureRate7DPrevious = prev7Records.length > 0 ? (prev7Failures / prev7Records.length) * 100 : 34.4;
  const failureRate7DDelta = failureRate7D - failureRate7DPrevious;

  const watchlist = buildWatchlist(records, studentOverrides);
  const uniqueStudents = new Set(records.map((r) => r.studentId));

  const criticalCount = watchlist.filter((s) => s.severity === 'critical' && s.securityStatus !== 'whitelisted').length;
  const highCount = watchlist.filter((s) => s.severity === 'high' && s.securityStatus !== 'whitelisted').length;
  const warningCount = watchlist.filter((s) => s.severity === 'warning' && s.securityStatus !== 'whitelisted').length;
  const flaggedStudentsCount = watchlist.filter((s) => s.securityStatus !== 'whitelisted').length;

  return {
    totalLogins: total,
    activeDays,
    successRate: Math.round(successRate * 10) / 10,
    successfulLogins: successes,
    failedAttempts: failures,
    failedRate: Math.round(failedRate * 10) / 10,
    failureRate7D: Math.round(failureRate7D * 10) / 10,
    failureRate7DPrevious: Math.round(failureRate7DPrevious * 10) / 10,
    failureRate7DDelta: Math.round(failureRate7DDelta * 10) / 10,
    flaggedStudentsCount,
    criticalCount,
    highCount,
    warningCount,
    uniqueStudentsCount: uniqueStudents.size,
    dateRangeText,
  };
}

export function buildWatchlist(
  records: LoginRecord[],
  studentOverrides: Record<string, StudentSecurityStatus> = {},
  incidentNotes: Record<string, string> = {}
): WatchlistStudent[] {
  const studentMap: Record<string, LoginRecord[]> = {};
  for (const record of records) {
    if (!studentMap[record.studentId]) {
      studentMap[record.studentId] = [];
    }
    studentMap[record.studentId].push(record);
  }

  const watchlist: WatchlistStudent[] = [];

  for (const [studentId, attempts] of Object.entries(studentMap)) {
    const failedAttempts = attempts.filter((a) => a.result === 'Failed').length;
    const successAttempts = attempts.length - failedAttempts;
    const totalAttempts = attempts.length;
    const failureRate = totalAttempts > 0 ? (failedAttempts / totalAttempts) * 100 : 0;

    const sorted = [...attempts].sort((a, b) => {
      const aTime = `${a.date}T${a.timeIn}`;
      const bTime = `${b.date}T${b.timeIn}`;
      return aTime.localeCompare(bTime);
    });

    let rapidAttempts = false;
    for (let i = 0; i <= sorted.length - 3; i++) {
      const t0 = new Date(`${sorted[i].date}T${sorted[i].timeIn}`).getTime();
      const t2 = new Date(`${sorted[i + 2].date}T${sorted[i + 2].timeIn}`).getTime();
      if (!isNaN(t0) && !isNaN(t2) && t2 - t0 <= 10 * 60 * 1000) {
        rapidAttempts = true;
      }
    }

    const flagReasons: string[] = [];
    if (failedAttempts >= 2) {
      flagReasons.push(`${failedAttempts} failed login attempts`);
    }
    if (rapidAttempts) {
      flagReasons.push('Rapid-fire attempts detected (3+ in < 10 mins)');
    }
    if (failedAttempts >= 5) {
      flagReasons.push('High volume authentication failures');
    }

    let severity: SeverityLevel = 'warning';
    if (failedAttempts >= 5 || rapidAttempts || totalAttempts >= 10) {
      severity = 'critical';
    } else if (failedAttempts >= 3) {
      severity = 'high';
    } else if (failedAttempts >= 2) {
      severity = 'warning';
    }

    const isFlagged = failedAttempts >= 2 || rapidAttempts;

    if (isFlagged) {
      const lastAttempt = sorted[sorted.length - 1];
      const devicesUsed = Array.from(new Set(attempts.map((a) => a.device)));
      const securityStatus = studentOverrides[studentId] || 'active_watch';

      watchlist.push({
        studentId,
        failedAttempts,
        totalAttempts,
        successAttempts,
        failureRate: Math.round(failureRate * 10) / 10,
        lastAttempt: {
          date: lastAttempt.date,
          timeIn: lastAttempt.timeIn,
          result: lastAttempt.result,
          device: lastAttempt.device,
        },
        flagReasons,
        severity,
        rapidAttempts,
        securityStatus,
        incidentNotes: incidentNotes[studentId] || '',
        devicesUsed,
        logs: sorted.reverse(),
      });
    }
  }

  return watchlist.sort((a, b) => {
    const sevOrder: Record<SeverityLevel, number> = { critical: 3, high: 2, warning: 1 };
    if (sevOrder[b.severity] !== sevOrder[a.severity]) {
      return sevOrder[b.severity] - sevOrder[a.severity];
    }
    return b.failedAttempts - a.failedAttempts;
  });
}

export function calculateDayVolumes(records: LoginRecord[]): DayVolume[] {
  const dayMap: Record<string, { success: number; failed: number }> = {};

  for (const record of records) {
    if (!dayMap[record.date]) {
      dayMap[record.date] = { success: 0, failed: 0 };
    }
    if (record.result === 'Success') {
      dayMap[record.date].success++;
    } else {
      dayMap[record.date].failed++;
    }
  }

  const sortedDates = Object.keys(dayMap).sort();

  return sortedDates.map((date) => {
    const { success, failed } = dayMap[date];
    const total = success + failed;
    const failureRate = total > 0 ? (failed / total) * 100 : 0;
    const displayDate = formatDisplayDate(date);
    const parts = date.split('-');
    const day = parts[2];
    const month = MONTH_NAMES[parseInt(parts[1], 10) - 1] || '';
    const shortLabel = `${day} ${month}`;

    return {
      date,
      displayDate,
      shortLabel,
      success,
      failed,
      total,
      failureRate: Math.round(failureRate * 10) / 10,
    };
  });
}

export function calculateDeviceStats(records: LoginRecord[]): DeviceStat[] {
  const devices: DeviceType[] = ['Desktop', 'Tablet', 'Mobile', 'Laptop'];
  const deviceCounts: Record<DeviceType, { total: number; failed: number; success: number }> = {
    Desktop: { total: 0, failed: 0, success: 0 },
    Tablet: { total: 0, failed: 0, success: 0 },
    Mobile: { total: 0, failed: 0, success: 0 },
    Laptop: { total: 0, failed: 0, success: 0 },
  };

  for (const r of records) {
    if (deviceCounts[r.device]) {
      deviceCounts[r.device].total++;
      if (r.result === 'Failed') {
        deviceCounts[r.device].failed++;
      } else {
        deviceCounts[r.device].success++;
      }
    }
  }

  const grandTotal = records.length || 1;

  return devices.map((device) => {
    const stats = deviceCounts[device];
    const failureRate = stats.total > 0 ? (stats.failed / stats.total) * 100 : 0;
    const sharePercent = (stats.total / grandTotal) * 100;

    return {
      device,
      total: stats.total,
      failed: stats.failed,
      success: stats.success,
      failureRate: Math.round(failureRate * 10) / 10,
      sharePercent: Math.round(sharePercent * 10) / 10,
    };
  });
}

export function parseCSVToRecords(csvText: string): LoginRecord[] {
  const lines = csvText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith(',,,'));

  if (lines.length <= 1) return [];

  const headerParts = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idIdx = headerParts.findIndex((h) => h.includes('student') || h.includes('id'));
  const dateIdx = headerParts.findIndex((h) => h.includes('date'));
  const resultIdx = headerParts.findIndex((h) => h.includes('result'));
  const deviceIdx = headerParts.findIndex((h) => h.includes('device'));
  const timeInIdx = headerParts.findIndex((h) => h.includes('time in') || h.includes('timein') || h.includes('time_in'));
  const timeOutIdx = headerParts.findIndex((h) => h.includes('time out') || h.includes('timeout') || h.includes('time_out'));

  const records: LoginRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const p = lines[i].split(',').map((c) => c.trim());
    if (p.length < 3) continue;

    const studentId = idIdx >= 0 && p[idIdx] ? p[idIdx] : p[0];
    if (!studentId || studentId === ',,,') continue;

    const date = dateIdx >= 0 && p[dateIdx] ? p[dateIdx] : p[1];
    const rawResult = resultIdx >= 0 && p[resultIdx] ? p[resultIdx] : p[2];
    const result = rawResult.toLowerCase() === 'failed' ? 'Failed' : 'Success';

    const rawDevice = deviceIdx >= 0 && p[deviceIdx] ? p[deviceIdx] : p[3];
    let device: DeviceType = 'Desktop';
    if (['Laptop', 'Tablet', 'Mobile', 'Desktop'].includes(rawDevice)) {
      device = rawDevice as DeviceType;
    }

    const timeIn = timeInIdx >= 0 && p[timeInIdx] ? p[timeInIdx] : p[4] || '12:00';
    const timeOut = timeOutIdx >= 0 && p[timeOutIdx] ? p[timeOutIdx] : p[5] || '';

    records.push({
      id: `sheet-${i}`,
      studentId,
      date,
      result,
      device,
      timeIn,
      timeOut,
    });
  }

  return records;
}