export function getQueryParam(name: string): string | undefined {
  try {
    return new URLSearchParams(window.location.search).get(name) ?? undefined;
  } catch {
    return undefined;
  }
}

export function getQueryNumber(name: string): number | undefined {
  const raw = getQueryParam(name);
  if (!raw) return undefined;
  const n = parseInt(raw, 10);
  return isNaN(n) || n <= 0 ? undefined : n;
}
