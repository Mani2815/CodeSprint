/** Case-insensitive, whitespace-trimmed substring match. Empty query matches everything. */
export function matchesSearch(value: string, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return value.toLowerCase().includes(normalized);
}
