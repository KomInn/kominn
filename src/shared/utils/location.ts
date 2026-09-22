export interface LatLng {
  lat: number;
  lng: number;
}

/** Tolker "lat,lng" slik det lagres i KmiLocation. */
export function parseLatLng(value?: string): LatLng | undefined {
  if (!value) return undefined;
  const parts = value.split(',').map((p) => parseFloat(p.trim()));
  if (parts.length !== 2 || parts.some((n) => isNaN(n))) return undefined;
  const [lat, lng] = parts;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return undefined;
  return { lat, lng };
}

export function formatLatLng(p: LatLng): string {
  return `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
}

/** Standard kartsenter (Asker rådhus) når konfigurasjonen mangler. */
export const DEFAULT_CENTER: LatLng = { lat: 59.8331, lng: 10.4392 };
export const DEFAULT_ZOOM = 11;
