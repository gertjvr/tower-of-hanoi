const KEY = 'hanoi-v1';

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // ignore storage errors
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!validateState(parsed)) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

function validateState(s) {
  if (!s || typeof s !== 'object') return false;
  const { diskCount, piles, moves, completed } = s;
  if (typeof diskCount !== 'number' || diskCount < 1 || diskCount > 12) return false;
  if (!Array.isArray(piles) || piles.length !== 3) return false;
  if (!piles.every(p => Array.isArray(p) && p.every(n => Number.isInteger(n)))) return false;
  if (typeof moves !== 'number') return false;
  if (typeof completed !== 'boolean') return false;
  // history is optional; if present, validate lightly
  if (s.history !== undefined) {
    if (!Array.isArray(s.history)) return false;
    for (const h of s.history) {
      if (!h || typeof h !== 'object') return false;
      if (!Number.isInteger(h.from) || !Number.isInteger(h.to)) return false;
      if (!Number.isInteger(h.disk)) return false;
      if (h.from < 0 || h.from > 2 || h.to < 0 || h.to > 2) return false;
    }
  }
  return true;
}
