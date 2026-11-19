import React, { useEffect, useState, useMemo, useRef } from 'react';
import { LeafletMap } from '../../components/map/LeafletMap';
import { OptimizedRouteResult, Report } from '../../types';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../components/common/Toast';
import { StatusBadge, WasteBadge } from '../../components/common/StatusBadge';
import {
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Route as RouteIcon,
  Truck,
  RotateCcw,
  Play,
  Pause,
  ArrowRight,
} from 'lucide-react';

export const OptimizedRoutePage: React.FC = () => {
  const { toast } = useToast();
  const [routeData, setRouteData] = useState<OptimizedRouteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [isAutoTouring, setIsAutoTouring] = useState(false);
  const autoTourTimerRef = useRef<any>(null);

  const depot = useMemo(
    () => ({
      lat: 13.0827,
      lng: 80.2707,
      address: 'Greater Chennai Corporation HQ (Ripon Building)',
    }),
    []
  );

  const [driverPosition, setDriverPosition] = useState<{
    lat: number;
    lng: number;
    label?: string;
    nextAddress?: string;
  }>({
    lat: 13.0827,
    lng: 80.2707,
    label: 'EcoDriver Truck #2 (Municipal Depot)',
    nextAddress: 'Stop #1 • Nungambakkam High Road',
  });

  useEffect(() => {
    calculateRoute();
    return () => {
      if (autoTourTimerRef.current) clearTimeout(autoTourTimerRef.current);
    };
  }, []);

  const calculateRoute = async () => {
    try {
      setLoading(true);
      setOptimizing(true);
      const res = await axiosClient.post('/routes/optimize', {
        startOrigin: {
          lat: depot.lat,
          lng: depot.lng,
          address: depot.address,
        },
      });

      if (res.data?.success) {
        let stops: Report[] = res.data.data.orderedStops || [];

        // Apply local overrides and local reports
        try {
          const overrides = JSON.parse(localStorage.getItem('cleancity_status_overrides') || '{}');
          if (overrides && Object.keys(overrides).length > 0) {
            stops = stops.map((s) => (overrides[s._id] ? { ...s, status: overrides[s._id] } : s));
          }
          const localCustom = JSON.parse(localStorage.getItem('cleancity_local_reports') || '[]');
          if (Array.isArray(localCustom)) {
            const statusMap = new Map(localCustom.map((r: Report) => [r._id, r.status]));
            stops = stops.map((s) =>
              statusMap.has(s._id) ? { ...s, status: statusMap.get(s._id)! } : s
            );
          }
        } catch {}

        setRouteData({
          ...res.data.data,
          orderedStops: stops,
        });

        // Determine current driver location based on completed stops
        const pickups = (stops as any[]).filter((s: any) => !s.isStart && s._id !== 'start');
        const nextTarget = pickups.find((s) => s.status !== 'COLLECTED');
        const collectedStops = pickups.filter((s) => s.status === 'COLLECTED');

        if (nextTarget && nextTarget.location) {
          // If some are collected, van is heading to or waiting at the next target
          setDriverPosition({
            lat: nextTarget.location.lat,
            lng: nextTarget.location.lng,
            label: `EcoDriver (Stop #${pickups.indexOf(nextTarget) + 1})`,
            nextAddress: nextTarget.location.address || 'Chennai',
          });
        } else if (collectedStops.length > 0 && collectedStops.length === pickups.length) {
          // All collected, van returned to depot
          setDriverPosition({
            lat: depot.lat,
            lng: depot.lng,
            label: 'EcoDriver (Ripon Depot - Route Complete)',
            nextAddress: 'All collection stops cleared',
          });
        } else {
          // Starting at depot
          setDriverPosition({
            lat: depot.lat,
            lng: depot.lng,
            label: 'EcoDriver (Municipal Depot)',
            nextAddress: pickups[0]?.location?.address || 'Stop #1',
          });
        }

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

  // Extract reports (excluding depot if first stop)
  const pickupStops: Report[] = useMemo(() => {
    return (routeData?.orderedStops || []).filter(
      (s: any) => !s.isStart && s._id !== 'start'
    );
  }, [routeData]);

  // Find the immediate next stop to collect
  const nextTargetIndex = pickupStops.findIndex((s) => s.status !== 'COLLECTED');
  const nextTargetStop = nextTargetIndex !== -1 ? pickupStops[nextTargetIndex] : null;

  // Command the van to smoothly drive to any given coordinate
  const handleDriveToLocation = (lat: number, lng: number, label: string, address?: string) => {
    setDriverPosition({
      lat,
      lng,
      label: `EcoDriver (${label})`,
      nextAddress: address || label,
    });
    toast(`🚚 EcoDriver van dispatched to ${label}`, 'info');
  };

  // Collect waste and smoothly drive the van to the NEXT stop location
  const handleMarkStopCollected = async (reportId: string) => {
    const targetIdx = pickupStops.findIndex((s) => s._id === reportId);
    const stopToCollect = pickupStops[targetIdx];
    if (!stopToCollect) return;

    // 1. Optimistically update local routeData
    setRouteData((prev) => {
      if (!prev) return prev;
      const updatedStops = prev.orderedStops.map((s) =>
        s._id === reportId ? { ...s, status: 'COLLECTED' as const } : s
      );
      return { ...prev, orderedStops: updatedStops };
    });

    // 2. Persist in localStorage overrides
    try {
      const overrides = JSON.parse(localStorage.getItem('cleancity_status_overrides') || '{}');
      overrides[reportId] = 'COLLECTED';
      localStorage.setItem('cleancity_status_overrides', JSON.stringify(overrides));

      const localCustom = JSON.parse(localStorage.getItem('cleancity_local_reports') || '[]');
      const updated = localCustom.map((r: Report) =>
        r._id === reportId ? { ...r, status: 'COLLECTED' } : r
      );
      localStorage.setItem('cleancity_local_reports', JSON.stringify(updated));

      // Push notification
      const notif = {
        _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user: stopToCollect.user?._id || null,
        targetRole: 'CITIZEN',
        title: 'Waste Collected & Cleared',
        message: `Waste Collected! Your report "${stopToCollect.title}" has been successfully collected by EcoDriver! Thank you.`,
        type: 'STATUS_UPDATE',
        reportId: stopToCollect._id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      const localNotifs = JSON.parse(localStorage.getItem('cleancity_local_notifications') || '[]');
      localNotifs.unshift(notif);
      localStorage.setItem('cleancity_local_notifications', JSON.stringify(localNotifs.slice(0, 50)));
      window.dispatchEvent(new Event('cleancity_notification_updated'));
    } catch {}

    // 3. Find the NEXT uncollected destination stop
    const remainingStops = pickupStops.filter(
      (s) => s._id !== reportId && s.status !== 'COLLECTED'
    );
    const nextStopAfterThis = remainingStops[0];

    // 4. Move driver van to the NEXT stop location!
    if (nextStopAfterThis && nextStopAfterThis.location?.lat && nextStopAfterThis.location?.lng) {
      setDriverPosition({
        lat: nextStopAfterThis.location.lat,
        lng: nextStopAfterThis.location.lng,
        label: `EcoDriver (Next: Stop #${pickupStops.indexOf(nextStopAfterThis) + 1})`,
        nextAddress: `Stop #${pickupStops.indexOf(nextStopAfterThis) + 1} • ${nextStopAfterThis.location?.address}`,
      });
      toast(
        `🚚 Stop #${targetIdx + 1} collected! Van driving to Stop #${pickupStops.indexOf(nextStopAfterThis) + 1}: ${nextStopAfterThis.location?.address}`,
        'success'
      );
    } else {
      // All stops cleared! Van returns to Municipal Depot!
      setDriverPosition({
        lat: depot.lat,
        lng: depot.lng,
        label: 'EcoDriver (All Collected - Returning to Depot)',
        nextAddress: 'Municipal Dispatch Depot (Ripon Building)',
      });
      toast(
        '🎉 All waste stops collected across Chennai! EcoDriver van returning to Municipal Depot.',
        'success'
      );
    }

    // 5. Send background status sync to server
    try {
      await axiosClient.patch(`/reports/${reportId}/status`, {
        status: 'COLLECTED',
        note: 'Collected during dynamic route run',
        title: stopToCollect.title,
      });
    } catch (err: any) {
      console.debug('Background status sync note:', err.message);
    }
  };

  // Reset demonstration back to beginning
  const handleResetRouteDemo = async () => {
    try {
      setLoading(true);
      if (autoTourTimerRef.current) clearTimeout(autoTourTimerRef.current);
      setIsAutoTouring(false);

      try {
        localStorage.removeItem('cleancity_status_overrides');
      } catch {}

      setRouteData((prev) => {
        if (!prev) return prev;
        const resetStops = prev.orderedStops.map((s, idx) => ({
          ...s,
          status: idx === 1 ? ('ASSIGNED' as const) : ('PENDING' as const),
        }));
        return { ...prev, orderedStops: resetStops };
      });

      // Move van smoothly back to depot
      setDriverPosition({
        lat: depot.lat,
        lng: depot.lng,
        label: 'EcoDriver #2 (Ripon Depot)',
        nextAddress: pickupStops[0]?.location?.address || 'Stop #1 (Nungambakkam High Road)',
      });

      toast('Route demonstration reset! EcoDriver van returned to Municipal Depot.', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Auto-drive simulation: drives through stops automatically step-by-step
  const toggleAutoDriveTour = () => {
    if (isAutoTouring) {
      setIsAutoTouring(false);
      if (autoTourTimerRef.current) clearTimeout(autoTourTimerRef.current);
      toast('Auto-drive tour paused.', 'info');
      return;
    }

    setIsAutoTouring(true);
    toast('🚀 Auto-drive simulation started! Watch the van advance from stop to stop.', 'success');

    let idx = 0;
    const stepTour = () => {
      // Find next uncollected stop
      const uncollected = pickupStops.filter((s) => s.status !== 'COLLECTED');
      if (uncollected.length === 0 || idx >= pickupStops.length) {
        handleDriveToLocation(depot.lat, depot.lng, 'Municipal Depot', depot.address);
        setIsAutoTouring(false);
        toast('🎉 Auto-tour complete! All stops collected.', 'success');
        return;
      }

      const currentStop = uncollected[0];
      const stopIndexInAll = pickupStops.indexOf(currentStop);

      // Move van to this stop
      handleDriveToLocation(
        currentStop.location.lat,
        currentStop.location.lng,
        `Stop #${stopIndexInAll + 1}`,
        currentStop.location.address
      );

      // After 2.4s glide, mark collected and trigger next
      autoTourTimerRef.current = setTimeout(() => {
        handleMarkStopCollected(currentStop._id);
        idx++;
        autoTourTimerRef.current = setTimeout(stepTour, 2600);
      }, 2400);
    };

    stepTour();
  };

  const completedCount = pickupStops.filter((s) => s.status === 'COLLECTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Live Vehicle Navigation & 2-Opt Optimizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Optimized Waste Collection Route
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time turn-by-turn route dispatch: the green van physically glides to the next stop location when waste is collected.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={toggleAutoDriveTour}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-sm ${
              isAutoTouring
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {isAutoTouring ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoTouring ? 'Pause Tour' : 'Auto-Drive Full Route 🚀'}</span>
          </button>

          <button
            onClick={handleResetRouteDemo}
            title="Reset route stops for demo"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-semibold text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={calculateRoute}
            disabled={optimizing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
            <span>{optimizing ? 'Re-optimizing...' : 'Re-calculate Route'}</span>
          </button>
        </div>
      </div>

      {/* Active Navigation Cockpit Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-gray-900 rounded-3xl p-5 text-white shadow-xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {nextTargetStop
                  ? `NEXT STOP: #${nextTargetIndex + 1} OF ${pickupStops.length}`
                  : 'ALL STOPS COMPLETED'}
              </span>
              <span className="text-gray-400 font-normal">
                ({completedCount} / {pickupStops.length} collected)
              </span>
            </div>
            <div className="text-base sm:text-lg font-extrabold truncate max-w-xl mt-0.5">
              {nextTargetStop
                ? nextTargetStop.title
                : 'All waste hotspots cleared! Returning to Ripon Depot.'}
            </div>
            <div className="text-xs text-gray-300 truncate max-w-xl">
              {nextTargetStop
                ? nextTargetStop.location?.address
                : 'Municipal central depot: Greater Chennai Corporation HQ'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {nextTargetStop ? (
            <button
              onClick={() => handleMarkStopCollected(nextTargetStop._id)}
              className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-sm bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95 shadow-lg shadow-black/20 flex items-center justify-center gap-2 shrink-0 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Collect & Move to Next Location →</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Route Finished</span>
            </div>
          )}
        </div>
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
            <div className="text-xs font-bold text-gray-500 uppercase">Completed Progress</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {completedCount} / {pickupStops.length} stops
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {pickupStops.length > 0 ? Math.round((completedCount / pickupStops.length) * 100) : 0}% cleared
            </div>
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
            driverPosition={driverPosition}
            routePolyline={routeData?.polyline}
            height="620px"
          />
        </div>

        {/* Turn-by-turn Stops List (1 col) */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between max-h-[620px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <span>Turn-by-Turn Sequence</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                2-Opt Verified
              </span>
            </div>

            <div className="overflow-y-auto max-h-[500px] divide-y divide-gray-100 dark:divide-gray-800/60 pr-1 mt-2 space-y-1">
              {/* Depot Start Point */}
              <div className="py-3 px-3 rounded-2xl bg-gray-50/60 dark:bg-gray-800/40 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    0
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      Municipal Depot (Start Hub)
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">Ripon Building, Chennai</div>
                  </div>
                </div>

                <button
                  onClick={() => handleDriveToLocation(depot.lat, depot.lng, 'Municipal Depot', depot.address)}
                  title="Move van back to Municipal Depot"
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:text-emerald-700 transition-colors shrink-0"
                >
                  Drive Here 🏢
                </button>
              </div>

              {pickupStops.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No stops assigned to optimize.
                </div>
              ) : (
                pickupStops.map((stop, idx) => {
                  const isCollected = stop.status === 'COLLECTED';
                  const isCurrentActive = nextTargetIndex === idx;

                  return (
                    <div
                      key={stop._id}
                      className={`p-3 rounded-2xl transition-all flex items-start justify-between gap-2.5 ${
                        isCurrentActive
                          ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-2 border-emerald-500 shadow-md shadow-emerald-500/10'
                          : isCollected
                          ? 'bg-gray-50/40 dark:bg-gray-800/20 opacity-70 border border-transparent'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/40 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isCollected
                              ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                              : isCurrentActive
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/30'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {isCollected ? '✓' : idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                              {stop.title}
                            </span>
                            {isCurrentActive && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-600 text-white tracking-wider">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {stop.location?.address}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <StatusBadge status={stop.status} size="sm" />
                            <WasteBadge wasteType={stop.wasteType} size="sm" />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 flex items-center gap-1.5 self-center">
                        {/* Direct Drive Here Button */}
                        <button
                          onClick={() =>
                            handleDriveToLocation(
                              stop.location.lat,
                              stop.location.lng,
                              `Stop #${idx + 1}`,
                              stop.location.address
                            )
                          }
                          title={`Drive van directly to Stop #${idx + 1}`}
                          className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-gray-600 dark:text-gray-300 hover:text-emerald-600 border border-gray-200 dark:border-gray-700 transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </button>

                        {!isCollected ? (
                          <button
                            onClick={() => handleMarkStopCollected(stop._id)}
                            title={
                              isCurrentActive
                                ? 'Collect Waste & Move Van to Next Location'
                                : 'Mark Stop as Collected'
                            }
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                              isCurrentActive
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 active:scale-95'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 hover:text-emerald-800 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Collect</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40">
                            ✓ Cleared
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
