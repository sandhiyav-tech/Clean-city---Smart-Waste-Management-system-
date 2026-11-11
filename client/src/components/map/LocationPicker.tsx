import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { pinPickerIcon } from './mapIcons';
import { Crosshair, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '../common/Toast';

interface LocationPickerProps {
  value: { lat: number; lng: number; address: string };
  onChange: (location: { lat: number; lng: number; address: string }) => void;
}

const MapEvents: React.FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to fly to new location when coordinates change programmatically
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, 15, { animate: true, duration: 1.2 });
  }, [center, map]);
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
  const { toast } = useToast();
  const [geoLoading, setGeoLoading] = useState(false);

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'CleanCityApp/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      }
    } catch {
      // Fallback
    }
    return `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}, Chennai`;
  };

  const handlePick = async (lat: number, lng: number) => {
    const address = await fetchAddress(lat, lng);
    onChange({ lat, lng, address });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = await fetchAddress(lat, lng);
        onChange({ lat, lng, address });
        setGeoLoading(false);
        toast('Location acquired successfully!', 'success');
      },
      (err) => {
        setGeoLoading(false);
        console.warn('Geolocation error:', err);
        // Fallback to Chennai Central if permission denied or error
        toast('Unable to retrieve location. Please click on the map to pin.', 'info');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const position: [number, number] = [value.lat || 13.0827, value.lng || 80.2707];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Pin Waste Location on Map <span className="text-rose-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
        >
          {geoLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Crosshair className="w-3.5 h-3.5" />
          )}
          <span>Use My Current Location</span>
        </button>
      </div>

      <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
        <MapContainer
          center={position}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onPick={handlePick} />
          <MapController center={position} />
          <Marker position={position} icon={pinPickerIcon} />
        </MapContainer>

        <div className="absolute top-3 left-3 z-[400] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span>Click anywhere to adjust pin</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
          Detected / Adjusted Address:
        </label>
        <input
          type="text"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder="e.g. Near Bus Stop, Ranganathan Street, T. Nagar"
          className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100"
        />
        <div className="text-[11px] text-gray-400 mt-1">
          Coordinates: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </div>
      </div>
    </div>
  );
};
