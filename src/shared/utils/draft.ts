/**
 * Utkast i nettleserens localStorage. Alle kall er tolerante: mangler lagring, returneres undefined.
 */
export function loadDraft<T>(key: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function saveDraft<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ingen lagring tilgjengelig. Utkastet lever kun i minnet.
  }
}

export function clearDraft(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignorer.
  }
}
