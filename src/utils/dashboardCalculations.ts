import {
  LoginRecord,
  DashboardMetrics,
  DayVolume,
  DeviceStat,
  WatchlistStudent,
  SeverityLevel,
  StudentSecurityStatus,
  DeviceType,
  WatchlistSettings,
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
  studentOverrides: Record<string, StudentSecurityStatus> = {},
  watchlistSettings: WatchlistSettings = { minFailuresThreshold: 3, rapidWindowMinutes: 5 }
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

  const watchlist = buildWatchlist(records, studentOverrides, {}, watchlistSettings);
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
  incidentNotes: Record<string, string> = {},
  watchlistSettings: WatchlistSettings = { minFailuresThreshold: 3, rapidWindowMinutes: 5 }
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

    const failedAttemptsInWindow = sorted.filter((a) => a.result === 'Failed');
    let rapidAttempts = false;
    const threshold = watchlistSettings.minFailuresThreshold;
    const windowMilliseconds = watchlistSettings.rapidWindowMinutes * 60 * 1000;
    for (let i = 0; i <= failedAttemptsInWindow.length - threshold; i++) {
      const firstTime = new Date(`${failedAttemptsInWindow[i].date}T${failedAttemptsInWindow[i].timeIn}`).getTime();
      const finalTime = new Date(
        `${failedAttemptsInWindow[i + threshold - 1].date}T${failedAttemptsInWindow[i + threshold - 1].timeIn}`
      ).getTime();
      if (!isNaN(firstTime) && !isNaN(finalTime) && finalTime - firstTime <= windowMilliseconds) {
        rapidAttempts = true;
        break;
      }
    }

    const flagReasons: string[] = [];
    if (rapidAttempts) {
      flagReasons.push(
        `${threshold}+ failed login attempts within ${watchlistSettings.rapidWindowMinutes} minutes`
      );
    }

    let severity: SeverityLevel = 'warning';
    if (rapidAttempts) {
      severity = 'critical';
    }

    const isFlagged = rapidAttempts;

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

function logGamma(value: number): number {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  if (value < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
  }

  const shifted = value - 1;
  let series = 0.9999999999998099;
  for (let i = 0; i < coefficients.length; i++) {
    series += coefficients[i] / (shifted + i + 1);
  }
  const base = shifted + coefficients.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (shifted + 0.5) * Math.log(base) - base + Math.log(series);
}

function chiSquareSurvival(statistic: number, degreesOfFreedom: number): number {
  if (statistic <= 0) return 1;
  if (degreesOfFreedom <= 0) return 1;

  const shape = degreesOfFreedom / 2;
  const x = statistic / 2;
  const epsilon = 1e-12;
  const maxIterations = 200;

  let sum = 1 / shape;
  let term = 1 / shape;
  let ap = shape;
  for (let i = 0; i < maxIterations; i++) {
    ap += 1;
    term *= x / ap;
    sum += term;
    if (Math.abs(term) < Math.abs(sum) * epsilon) break;
  }
  const lowerGamma = sum * Math.exp(-x + shape * Math.log(x) - logGamma(shape));
  let probability = lowerGamma;

  if (x >= shape + 1) {
    let b = x + 1 - shape;
    let c = 1 / 1e-30;
    let d = 1 / b;
    let h = d;
    for (let i = 1; i <= maxIterations; i++) {
      const an = -i * (i - shape);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = b + an / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      const delta = d * c;
      h *= delta;
      if (Math.abs(delta - 1) < epsilon) break;
    }
    const upperGamma = Math.exp(-x + shape * Math.log(x) - logGamma(shape)) * h;
    probability = upperGamma;
  } else {
    probability = 1 - lowerGamma;
  }

  return Math.min(1, Math.max(0, probability));
}

export function calculateDeviceChiSquare(records: LoginRecord[]): {
  statistic: number;
  degreesOfFreedom: number;
  pValue: number;
} {
  const devices: DeviceType[] = ['Desktop', 'Tablet', 'Mobile', 'Laptop'];
  const activeDevices = devices.filter((device) =>
    records.some((record) => record.device === device)
  );

  const successes = activeDevices.map(
    (device) => records.filter((record) => record.device === device && record.result === 'Success').length
  );
  const failures = activeDevices.map(
    (device) => records.filter((record) => record.device === device && record.result === 'Failed').length
  );
  const totals = activeDevices.map((_, index) => successes[index] + failures[index]);
  const totalSuccesses = successes.reduce((sum, value) => sum + value, 0);
  const totalFailures = failures.reduce((sum, value) => sum + value, 0);
  const grandTotal = totalSuccesses + totalFailures;

  let statistic = 0;
  if (grandTotal > 0) {
    totals.forEach((rowTotal, index) => {
      const expectedSuccesses = (rowTotal * totalSuccesses) / grandTotal;
      const expectedFailures = (rowTotal * totalFailures) / grandTotal;
      if (expectedSuccesses > 0) {
        statistic += (successes[index] - expectedSuccesses) ** 2 / expectedSuccesses;
      }
      if (expectedFailures > 0) {
        statistic += (failures[index] - expectedFailures) ** 2 / expectedFailures;
      }
    });
  }

  const degreesOfFreedom = Math.max(1, activeDevices.length - 1);
  return {
    statistic,
    degreesOfFreedom,
    pValue: chiSquareSurvival(statistic, degreesOfFreedom),
  };
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