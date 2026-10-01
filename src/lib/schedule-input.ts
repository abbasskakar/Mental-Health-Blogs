// Converts between ISO timestamps and the value of an
// <input type="datetime-local">, which is the admin's local wall-clock time
// with no timezone ("2026-10-02T09:30").

const pad = (n: number) => String(n).padStart(2, '0');

export function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(local: string): string | null {
  if (!local) return null;
  const d = new Date(local); // parsed as local time
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function nowLocalInput(): string {
  return toLocalInput(new Date().toISOString());
}
