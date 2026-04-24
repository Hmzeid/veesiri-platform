import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, LayerGroup, Polygon, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';

// Approx polygons for the 13 Saudi admin regions (stylized)
const REGIONS: { name: string; coords: [number, number][] }[] = [
  { name: 'Northern Borders', coords: [[32.5, 37.8],[32.4, 42.7],[30.6, 43.3],[30.3, 38.5]] },
  { name: 'Al-Jawf', coords: [[32.5, 37.8],[30.3, 38.5],[29.0, 39.5],[29.2, 37.0],[30.4, 34.6]] },
  { name: 'Tabuk', coords: [[30.4, 34.6],[29.2, 37.0],[27.4, 37.6],[26.2, 35.5],[27.5, 34.8]] },
  { name: 'Madinah', coords: [[27.4, 37.6],[27.8, 39.5],[26.5, 41.0],[25.0, 40.5],[24.2, 38.6],[26.2, 35.5]] },
  { name: 'Hail', coords: [[29.0, 39.5],[29.0, 41.5],[27.5, 42.8],[26.5, 41.0],[27.8, 39.5],[30.3, 38.5]] },
  { name: 'Qassim', coords: [[29.0, 41.5],[28.2, 44.5],[26.3, 45.3],[27.5, 42.8]] },
  { name: 'Riyadh', coords: [[28.2, 44.5],[27.0, 47.8],[24.0, 48.8],[21.8, 47.0],[21.5, 44.5],[24.0, 43.0],[26.3, 45.3]] },
  { name: 'Eastern Province', coords: [[28.5, 48.8],[28.0, 50.3],[26.0, 52.0],[24.0, 55.4],[20.5, 55.5],[19.5, 51.5],[19.5, 48.8],[27.0, 47.8]] },
  { name: 'Makkah', coords: [[24.2, 38.6],[25.0, 40.5],[22.5, 42.5],[21.0, 41.8],[19.5, 40.2],[21.5, 38.5]] },
  { name: 'Al-Bahah', coords: [[21.0, 41.8],[22.5, 42.5],[20.2, 42.0],[20.0, 41.0]] },
  { name: 'Asir', coords: [[21.0, 41.8],[21.2, 43.0],[19.0, 44.5],[17.7, 43.2],[18.6, 41.5]] },
  { name: 'Jazan', coords: [[18.6, 41.5],[17.7, 43.2],[16.4, 42.5],[17.0, 41.6]] },
  { name: 'Najran', coords: [[17.7, 43.2],[19.0, 44.5],[18.5, 47.0],[17.2, 48.0],[16.6, 46.0],[16.8, 43.5]] },
];

export type MapFactory = {
  id: string;
  nameAr?: string;
  nameEn?: string;
  industryGroup?: string;
  region?: string | null;
  lat: number;
  lng: number;
  overallScore: number | null;
  sidfFinanced?: boolean;
};

function scoreColor(score: number | null | undefined) {
  if (score === null || score === undefined) return '#64748b';
  if (score < 1) return '#dc2626';
  if (score < 2) return '#f97316';
  if (score < 3) return '#eab308';
  if (score < 4) return '#84cc16';
  return '#059669';
}

function FitBounds({ factories }: { factories: MapFactory[] }) {
  const map = useMap();
  useEffect(() => {
    if (factories.length === 0) return;
    const latlngs = factories
      .filter((f) => f.lat && f.lng)
      .map((f) => [f.lat, f.lng] as [number, number]);
    if (latlngs.length) {
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
    }
  }, [factories, map]);
  return null;
}

export default function SaudiMap({
  factories,
  regionScores,
  onSelect,
  height = 520,
  theme = 'light',
  anonymize = false,
}: {
  factories: MapFactory[];
  regionScores?: Record<string, number>;
  onSelect?: (id: string) => void;
  height?: number;
  theme?: 'light' | 'dark';
  anonymize?: boolean;
  showLegend?: boolean;
}) {
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const attribution = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const regionFill = (name: string) => {
    if (!regionScores) return theme === 'dark' ? '#1f2a44' : '#ecfdf5';
    const s = regionScores[name];
    if (s === undefined || s === null) return theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f4f6';
    return scoreColor(s);
  };

  const center: [number, number] = [24.5, 45];
  const countryBounds = useMemo<[[number, number], [number, number]]>(
    () => [[15.5, 33.0], [33.0, 56.5]],
    [],
  );

  return (
    <div
      style={{
        position: 'relative',
        height,
        borderRadius: 16,
        overflow: 'hidden',
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #d1fae5',
        boxShadow: theme === 'dark' ? '0 0 40px rgba(0,108,53,0.08) inset' : 'none',
      }}
    >
      <MapContainer
        center={center}
        zoom={6}
        minZoom={4}
        maxZoom={14}
        maxBounds={[[10, 25], [40, 65]]}
        maxBoundsViscosity={0.8}
        scrollWheelZoom
        zoomControl={false}
        style={{ width: '100%', height: '100%', background: theme === 'dark' ? '#0b1220' : '#e0f2fe' }}
      >
        <ZoomControl position="bottomright" />
        <TileLayer url={tileUrl} attribution={attribution} />
        <FitBounds factories={factories} />

        <LayersControl position="topright" collapsed>
          <LayersControl.Overlay checked name="Regions (SIRI heat)">
            <LayerGroup>
              {REGIONS.map((r) => (
                <Polygon
                  key={r.name}
                  positions={r.coords}
                  pathOptions={{
                    color: theme === 'dark' ? '#C8A548' : '#065f46',
                    weight: 1,
                    opacity: 0.5,
                    fillColor: regionFill(r.name),
                    fillOpacity: regionScores?.[r.name] !== undefined ? 0.38 : 0.08,
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                      {regionScores?.[r.name] !== undefined && (
                        <div style={{ marginTop: 6 }}>
                          Avg SIRI: <strong>{regionScores[r.name].toFixed(2)}</strong>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Factories">
            <LayerGroup>
              {factories.map((f) => {
                if (!f.lat || !f.lng) return null;
                const color = scoreColor(f.overallScore);
                return (
                  <CircleMarker
                    key={f.id}
                    center={[f.lat, f.lng]}
                    radius={9}
                    pathOptions={{
                      color: '#fff',
                      weight: 2,
                      fillColor: color,
                      fillOpacity: 0.9,
                    }}
                    eventHandlers={onSelect ? { click: () => onSelect(f.id) } : undefined}
                  >
                    <Popup>
                      <div style={{ minWidth: 220 }}>
                        {!anonymize && (
                          <>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{f.nameEn}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              {f.nameAr}
                            </div>
                          </>
                        )}
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                          {f.industryGroup?.replace(/_/g, ' ')} · {f.region}
                        </div>
                        {f.overallScore !== null && (
                          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                background: color,
                                color: '#fff',
                                padding: '3px 10px',
                                borderRadius: 999,
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              {f.overallScore.toFixed(2)}
                            </span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>SIRI Score</span>
                          </div>
                        )}
                        {f.sidfFinanced && (
                          <div style={{ marginTop: 8, fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>
                            SIDF Financed
                          </div>
                        )}
                        {onSelect && !anonymize && (
                          <button
                            onClick={() => onSelect(f.id)}
                            style={{
                              marginTop: 12,
                              background: '#006C35',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 12px',
                              cursor: 'pointer',
                              width: '100%',
                              fontWeight: 600,
                            }}
                          >
                            View factory →
                          </button>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>

      {/* Floating legend */}
      <div
        style={{
          position: 'absolute',
          insetInlineStart: 14, bottom: 14,
          background: theme === 'dark' ? 'rgba(11,18,32,0.9)' : 'rgba(255,255,255,0.96)',
          color: theme === 'dark' ? '#e2e8f0' : '#0b1220',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: 11,
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 400,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6, letterSpacing: '0.08em' }}>SIRI SCORE</div>
        {[
          { label: '4.0+  Leading', c: '#059669' },
          { label: '3.0–4.0  On-track', c: '#84cc16' },
          { label: '2.0–3.0  Developing', c: '#eab308' },
          { label: '1.0–2.0  Low', c: '#f97316' },
          { label: '0.0–1.0  Critical', c: '#dc2626' },
        ].map((r) => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: r.c, display: 'inline-block' }} />
            {r.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export { scoreColor };
