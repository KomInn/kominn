import * as React from 'react';
import * as L from 'leaflet';
import { Button, Caption1, makeStyles, tokens } from '@fluentui/react-components';
import { Dismiss16Regular } from '@fluentui/react-icons';
import './leaflet.global.css';
import { DEFAULT_CENTER, DEFAULT_ZOOM, formatLatLng, parseLatLng, type LatLng } from '../utils';

/** Kartverkets åpne bakgrunnskart. Ingen nøkkel. */
export const KARTVERKET_TILES = 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png';
export const KARTVERKET_ATTRIBUTION = '&copy; <a href="https://www.kartverket.no/">Kartverket</a>';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', rowGap: tokens.spacingVerticalXS },
  map: {
    width: '100%',
    height: '280px',
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    overflow: 'hidden'
  },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', columnGap: tokens.spacingHorizontalS }
});

export interface LocationPickerProps {
  /** "lat,lng" eller tom. */
  value?: string;
  onChange: (value: string | undefined) => void;
  center?: LatLng;
  zoom?: number;
  readOnly?: boolean;
  helpText?: string;
  clearLabel?: string;
}

/**
 * Kart der brukeren klikker for å sette et punkt. Lagrer "lat,lng".
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, center, zoom, readOnly, helpText, clearLabel }) => {
  const styles = useStyles();
  const container = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<L.Map>();
  const marker = React.useRef<L.CircleMarker>();
  const point = parseLatLng(value);

  React.useEffect(() => {
    if (!container.current || map.current) return;
    const start = point ?? center ?? DEFAULT_CENTER;
    const m = L.map(container.current, { center: [start.lat, start.lng], zoom: point ? Math.max(zoom ?? DEFAULT_ZOOM, 14) : zoom ?? DEFAULT_ZOOM, scrollWheelZoom: false });
    L.tileLayer(KARTVERKET_TILES, { attribution: KARTVERKET_ATTRIBUTION, maxZoom: 18 }).addTo(m);
    if (!readOnly) {
      m.on('click', (e: L.LeafletMouseEvent) => onChange(formatLatLng({ lat: e.latlng.lat, lng: e.latlng.lng })));
    }
    map.current = m;
    return () => {
      m.remove();
      map.current = undefined;
      marker.current = undefined;
    };
    // Kartet opprettes én gang; senere endringer håndteres under.
  }, []);

  React.useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (point) {
      if (!marker.current) {
        marker.current = L.circleMarker([point.lat, point.lng], { radius: 9, color: '#1e6b5a', weight: 3, fillColor: '#5fbfa3', fillOpacity: 0.9 }).addTo(m);
      } else {
        marker.current.setLatLng([point.lat, point.lng]);
      }
    } else if (marker.current) {
      marker.current.remove();
      marker.current = undefined;
    }
  }, [point?.lat, point?.lng]);

  return (
    <div className={styles.root}>
      <div ref={container} className={styles.map} role="application" aria-label="Kart" />
      <div className={styles.footer}>
        <Caption1>{point ? formatLatLng(point) : helpText}</Caption1>
        {point && !readOnly && (
          <Button size="small" appearance="subtle" icon={<Dismiss16Regular />} onClick={() => onChange(undefined)}>
            {clearLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
