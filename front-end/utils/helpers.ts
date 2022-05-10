import type { ScannerIssueEntity } from '../api-routes/types/scanner';

export function slugify(term: string) {
  return term
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function toLocalString(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    minute: '2-digit',
    hour12: true,
    hour: '2-digit',
    hourCycle: 'h12',
  });
}

export function parseIssue(issue: string) {
  let formattedIssue: ScannerIssueEntity | null;
  try {
    formattedIssue = JSON.parse(issue) as ScannerIssueEntity;
  } catch (e) {
    formattedIssue = null;
  }

  return formattedIssue;
}

export function createShortVersionOfKeyForVunClass(key: string) {
  let splittedValue: string | string[] = key.split('_');
  let splittedLength = splittedValue.length;

  splittedValue = splittedValue[0] + splittedValue[splittedLength - 1];

  if (!splittedValue) {
    splittedValue = key;
  }

  if (splittedValue.length >= 7) {
    return splittedValue.substring(0, 7) + '...';
  }
  return splittedValue;
}

export function createShortVersion(key: string) {
  let splittedValue: string | string[] = key.split(',');
  let splittedLength = splittedValue.length;

  splittedValue = splittedValue[splittedLength - 1];

  if (!splittedValue) {
    splittedValue = key;
  }

  if (splittedValue.length >= 7) {
    return splittedValue.substring(0, 7) + '...';
  }
  return splittedValue;
}

export function findScanType(
  scanner: string,
): 'ss' | 'sast' | 'sca' | 'unknown' {
  if (scanner === 'gosec' || scanner === 'find-sec-bugs') {
    return 'sast';
  }

  if (scanner === 'dependency-check' || scanner === 'npm-audit') {
    return 'sca';
  }

  if (scanner === 'gitleaks') {
    return 'ss';
  }

  return 'unknown';
}

/**
 *
 * @param initTime
 * @param compareInHr
 * @returns true if start time exceeds compared time
 */
export function compareTimeDifference(
  initTime: string | number,
  compareInHr: number = 24,
): boolean {
  const startTime = new Date(initTime).getHours();
  const endTime = new Date(new Date().getTime()).getHours();

  return endTime - startTime > compareInHr;
}

export function convertToInternationalNumericalSystem(labelValue: number) {
  return Math.abs(Number(labelValue)) >= 1.0e9
    ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + 'B'
    : // Six Zeroes for Millions
    Math.abs(Number(labelValue)) >= 1.0e6
    ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + 'M'
    : // Three Zeroes for Thousands
    Math.abs(Number(labelValue)) >= 1.0e3
    ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(2) + 'K'
    : Math.abs(Number(labelValue));
}
