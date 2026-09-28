import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Asset } from '../types/asset';
import { ConditionBadge, RiskBadge, TypeBadge } from './Badges';
import { MapPin, Eye } from 'lucide-react';

// Custom marker icon helper for light theme map
const createCustomIcon = (condition: string) => {
  let color = '#10b981'; // Good -> Emerald Green
  if (condition === 'MODERATE') color = '#f59e0b'; // Moderate -> Amber Yellow
  if (condition === 'POOR') color = '#f97316'; // Poor -> Orange
  if (condition === 'CRITICAL') color = '#ef4444'; // Critical -> Red

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="40">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#ffffff" stroke-width="1.8"/>
      <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
    </svg>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });
};

interface MapViewProps {
  assets: Asset[];
  categoryFilter?: string;
  onSelectAsset: (assetId: string) => void;
}

// Map Auto-Fitter
const MapAutoFit: React.FC<{ assets: Asset[] }> = ({ assets }) => {
  const map = useMap();

  useEffect(() => {
    if (assets.length > 0) {
      const bounds = L.latLngBounds(assets.map((a) => [a.latitude, a.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [assets, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({ assets, categoryFilter = 'ALL', onSelectAsset }) => {
  // Filter assets by selected category if applicable
  const filteredAssets = categoryFilter === 'ALL'
    ? assets
    : assets.filter(a => a.assetType === categoryFilter);

  // Default Gujarat center
  const centerLat = 22.2587;
  const centerLng = 71.1924;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Legend & Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 font-outfit flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> Infrastructure Asset GIS Map
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Interactive geo-spatial asset condition mapping across R&B districts ({filteredAssets.length} markers)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="flex items-center gap-1.5 font-bold text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Good
          </span>
          <span className="flex items-center gap-1.5 font-bold text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate
          </span>
          <span className="flex items-center gap-1.5 font-bold text-orange-700">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High Risk / Poor
          </span>
          <span className="flex items-center gap-1.5 font-bold text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Critical
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[520px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={8}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#e2e8f0' }}
        >
          {/* OpenStreetMap Standard Map Tiles - Free & No API Key Required */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapAutoFit assets={filteredAssets} />

          {filteredAssets.map((asset) => (
            <Marker
              key={asset.id}
              position={[asset.latitude, asset.longitude]}
              icon={createCustomIcon(asset.currentCondition)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 space-y-2 text-slate-900 min-w-[210px]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {asset.assetCode}
                    </span>
                    <TypeBadge type={asset.assetType} size="sm" />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                    {asset.name}
                  </h4>
                  <div className="text-[11px] text-slate-600 font-medium">
                    District: <strong>{asset.district}</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <ConditionBadge condition={asset.currentCondition} size="sm" />
                    {asset.latestRisk && (
                      <RiskBadge riskLevel={asset.latestRisk.riskLevel} score={asset.latestRisk.totalRiskScore} size="sm" />
                    )}
                  </div>
                  <button
                    onClick={() => onSelectAsset(asset.id)}
                    className="w-full mt-2 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Digital Passport
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
