import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Report } from '../../types';
import { createStatusIcon, depotIcon } from './mapIcons';
import { StatusBadge, WasteBadge } from '../common/StatusBadge';
import { MapPin, Calendar, Clock, Navigation } from 'lucide-react';

interface LeafletMapProps {
  reports: Report[];
  center?: [number, number];
  zoom?: number;
  routePolyline?: [number, number][];
  startOrigin?: { lat: number; lng: number; address?: string };
  height?: string;
  onMarkerSelect?: (report: Report) => void;
}

// Helper to auto-fit map bounds when markers change
const AutoFitBounds: React.FC<{ reports: Report[]; routePolyline?: [number, number][] }> = ({
  reports,
  routePolyline,
}) => {
  const map = useMap();

  useEffect(() => {
    if (routePolyline && routePolyline.length > 0) {
      map.fitBounds(routePolyline, { padding: [40, 40] });
    } else if (reports.length > 0) {
      const validPoints = reports
        .filter((r) => r.location && typeof r.location.lat === 'number' && typeof r.location.lng === 'number')
        .map((r) => [r.location.lat, r.location.lng] as [number, number]);

      if (validPoints.length > 0) {
        map.fitBounds(validPoints, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [map, reports, routePolyline]);

  return null;
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  reports,
  center = [13.0827, 80.2707], // Default Chennai Ripon Building
  zoom = 12,
  routePolyline,
  startOrigin,
  height = '550px',
  onMarkerSelect,
}) => {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoFitBounds reports={reports} routePolyline={routePolyline} />

        {/* Start origin marker (e.g. Depot) */}
        {startOrigin && (
          <Marker position={[startOrigin.lat, startOrigin.lng]} icon={depotIcon}>
            <Popup>
              <div className="p-2 space-y-1">
                <span className="font-bold text-xs uppercase tracking-wide text-emerald-600 block">
                  Municipal Dispatch Hub
                </span>
                <p className="text-sm font-semibold text-gray-900">{startOrigin.address || 'Chennai Central Hub'}</p>
                <p className="text-xs text-gray-500">Fleet Route Starting Point</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Report Markers */}
        {reports.map((report) => {
          if (!report.location || typeof report.location.lat !== 'number' || typeof report.location.lng !== 'number') {
            return null;
          }

          return (
            <Marker
              key={report._id}
              position={[report.location.lat, report.location.lng]}
              icon={createStatusIcon(report.status)}
              eventHandlers={{
                click: () => onMarkerSelect && onMarkerSelect(report),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="w-64 max-w-xs space-y-2.5 p-1 text-gray-900 font-sans">
                  {report.imageUrl && (
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-full h-28 object-cover rounded-lg border border-gray-100"
                    />
                  )}

                  <div className="flex items-center justify-between gap-1">
                    <StatusBadge status={report.status} size="sm" />
                    <WasteBadge wasteType={report.wasteType} size="sm" />
                  </div>

                  <h4 className="font-bold text-sm text-gray-900 leading-snug">{report.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">{report.description}</p>

                  <div className="text-[11px] text-gray-500 flex items-start gap-1.5 pt-1 border-t border-gray-100">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{report.location.address || 'Chennai'}</span>
                  </div>

                  {report.assignedDriver && (
                    <div className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
                      <Navigation className="w-3 h-3" />
                      <span>Driver: {report.assignedDriver.name}</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Polyline */}
        {routePolyline && routePolyline.length > 1 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: '#059669', // Emerald forest
              weight: 5,
              opacity: 0.85,
              dashArray: '8, 8',
            }}
          />
        )}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 text-xs flex flex-wrap items-center gap-3">
        <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
          <span className="text-gray-600 dark:text-gray-400">Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200"></span>
          <span className="text-gray-600 dark:text-gray-400">Assigned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-200"></span>
          <span className="text-gray-600 dark:text-gray-400">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
          <span className="text-gray-600 dark:text-gray-400">Collected</span>
        </div>
      </div>
    </div>
  );
};

