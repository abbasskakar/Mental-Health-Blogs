/**
 * Safe CSV cell encoding:
 * - wraps values containing commas, quotes, or newlines in double quotes
 * - doubles inner quotes (RFC 4180)
 * - neutralizes spreadsheet formula injection (cells starting with = + - @)
 */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);

  // Formula-injection guard for Excel/Sheets
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }

  if (/[",\n\r]/.test(s)) {
    s = `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Builds a CSV line from cells. */
export function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(',');
}
