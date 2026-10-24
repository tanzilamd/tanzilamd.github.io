export function loadLocal<T>(key: string, valid: (value: unknown) => value is T, fallback: T): { value: T; saved: boolean } {
  try {
    const raw = localStorage.getItem(key);
    const value: unknown = raw && raw.length < 10000 ? JSON.parse(raw) : null;
    return { value: valid(value) ? value : fallback, saved: true };
  } catch { return { value: fallback, saved: false }; }
}
export function saveLocal(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
export const validScore = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 999999;
