import React, { useEffect, useState } from 'react';
import { LeafletMap } from '../../components/map/LeafletMap';
import { OptimizedRouteResult, Report } from '../../types';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../components/common/Toast';
import { StatusBadge, WasteBadge } from '../../components/common/StatusBadge';
import {
  Navigation,
  Compass,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Route as RouteIcon,
} from 'lucide-react';

export const OptimizedRoutePage: React.FC = () => {
  const { toast } = useToast();
  const [routeData, setRouteData] = useState<OptimizedRouteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    calculateRoute();
  }, []);

  const calculateRoute = async () => {
    try {
      setLoading(true);
      setOptimizing(true);
      const res = await axiosClient.post('/routes/optimize', {
        // Optional custom depot start origin
        startOrigin: {
          lat: 13.0827,
          lng: 80.2707,
          address: 'Greater Chennai Corporation Central Depot',
        },
      });

      if (res.data?.success) {
        setRouteData(res.data.data);
        toast('Route optimized using Nearest-Neighbor + 2-Opt TSP algorithm!', 'success');
      }
    } catch (err: any) {
      console.error('Failed to optimize route:', err);
      toast(err.response?.data?.message || 'Failed to calculate optimal route', 'error');
    } finally {
      setLoading(false);
      setOptimizing(false);
    }
  };

  const handleMarkStopCollected = async (reportId: string) => {
    try {
      await axiosClient.patch(`/reports/${reportId}/status`, {
        status: 'COLLECTED',
        note: 'Collected during optimized route run',
      });
      toast('Stop marked as collected!', 'success');
      // Refresh route
      calculateRoute();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update stop', 'error');
    }
  };

  const depot = {
    lat: 13.0827,
    lng: 80.2707,
    address: 'Greater Chennai Corporation HQ (Ripon Building)',
  };

  // Extract reports (excluding depot if first stop)
  const pickupStops: Report[] = (routeData?.orderedStops || []).filter(
    (s) => !s.isStart && s._id !== 'start'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>2-Opt TSP Route Optimizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Optimized Waste Collection Route
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Calculated via Haversine distance matrix with 2-Opt pairwise edge swaps to minimize vehicle fuel & travel time.
          </p>
        </div>

        <button
          onClick={calculateRoute}
          disabled={optimizing}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
          <span>{optimizing ? 'Re-optimizing...' : 'Re-calculate Route'}</span>
        </button>
      </div>

      {/* Route KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <RouteIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase">Total Route Distance</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {routeData ? `${routeData.totalDistanceKm} km` : '0 km'}
            </div>
            <div className="text-[11px] text-gray-400">Minimal driving trajectory</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase">Est. Total Duration</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {routeData ? `${routeData.estimatedMinutes} mins` : '0 mins'}
            </div>
            <div className="text-[11px] text-gray-400">Includes 10m collection per stop</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase">Total Scheduled Stops</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {pickupStops.length} stops
            </div>
            <div className="text-[11px] text-gray-400">Sequential order optimized</div>
          </div>
        </div>
      </div>

      {/* Map with Polyline and Sequential Stops list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map (2 cols) */}
        <div className="lg:col-span-2">
          <LeafletMap
            reports={pickupStops}
            startOrigin={depot}
            routePolyline={routeData?.polyline}
            height="600px"
          />
        </div>

        {/* Turn-by-turn Stops List (1 col) */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between max-h-[600px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Turn-by-Turn Stop Sequence
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                2-Opt Verified
              </span>
            </div>

            <div className="overflow-y-auto max-h-[460px] divide-y divide-gray-100 dark:divide-gray-800/60 pr-1 mt-2">
              {/* Depot Start Point */}
              <div className="py-3 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  0
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    Municipal Depot (Start)
                  </div>
                  <div className="text-[11px] text-gray-400">Ripon Building, Chennai</div>
                </div>
              </div>

              {pickupStops.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No stops assigned to optimize.
                </div>
              ) : (
                pickupStops.map((stop, idx) => (
                  <div key={stop._id} className="py-3 flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                          {stop.title}
                        </div>
                        <div className="text-[11px] text-gray-500 line-clamp-1">
                          {stop.location?.address}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <StatusBadge status={stop.status} size="sm" />
                          <WasteBadge wasteType={stop.wasteType} size="sm" />
                        </div>
                      </div>
                    </div>

                    {stop.status !== 'COLLECTED' ? (
                      <button
                        onClick={() => handleMarkStopCollected(stop._id)}
                        title="Mark as Collected"
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 shrink-0 self-center"
                      >
                        Collected
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold shrink-0 self-center">
                        ✓ Done
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

