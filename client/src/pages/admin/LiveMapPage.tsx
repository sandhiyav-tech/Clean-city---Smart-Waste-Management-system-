import React, { useEffect, useState } from 'react';
import { LeafletMap } from '../../components/map/LeafletMap';
import { Report } from '../../types';
import axiosClient from '../../api/axiosClient';
import { StatusBadge, WasteBadge } from '../../components/common/StatusBadge';
import { MapPin, Filter, Layers, Navigation, Calendar, UserCheck } from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [wasteTypeFilter, setWasteTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchMapReports();
  }, [statusFilter, wasteTypeFilter]);

  const fetchMapReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (wasteTypeFilter !== 'ALL') params.append('wasteType', wasteTypeFilter);

      const res = await axiosClient.get(`/reports?${params.toString()}`);
      if (res.data?.success) {
        setReports(res.data.data.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch map reports:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Geospatial Fleet Monitoring
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5">
            Chennai Live Waste Heatmap
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time coordinates of all reported municipal waste hotspots.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending (Orange)</option>
            <option value="ASSIGNED">Assigned (Blue)</option>
            <option value="IN_PROGRESS">In Progress (Purple)</option>
            <option value="COLLECTED">Collected (Green)</option>
          </select>

          <select
            value={wasteTypeFilter}
            onChange={(e) => setWasteTypeFilter(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200"
          >
            <option value="ALL">All Waste Types</option>
            <option value="ORGANIC">Organic</option>
            <option value="PLASTIC">Plastic</option>
            <option value="METAL">Metal</option>
            <option value="E-WASTE">E-Waste</option>
            <option value="HAZARDOUS">Hazardous</option>
            <option value="MIXED">Mixed</option>
          </select>
        </div>
      </div>

      {/* Main Map with optional selected details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={selectedReport ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <LeafletMap
            reports={reports}
            height="650px"
            onMarkerSelect={(report) => setSelectedReport(report)}
          />
        </div>

        {/* Selected Report Sidebar */}
        {selectedReport && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 animate-fade-in flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Selected Hotspot
                </span>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕ Close
                </button>
              </div>

              {selectedReport.imageUrl && (
                <img
                  src={selectedReport.imageUrl}
                  alt=""
                  className="w-full h-44 object-cover rounded-2xl border border-gray-100 dark:border-gray-800"
                />
              )}

              <div className="flex items-center gap-2">
                <StatusBadge status={selectedReport.status} size="sm" />
                <WasteBadge wasteType={selectedReport.wasteType} size="sm" />
              </div>

              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug">
                  {selectedReport.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {selectedReport.description}
                </p>
              </div>

              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{selectedReport.location.address}</span>
                </div>
                {selectedReport.assignedDriver && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                    <Navigation className="w-4 h-4 shrink-0" />
                    <span>Assigned to: {selectedReport.assignedDriver.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Reported {new Date(selectedReport.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => (window.location.href = '/admin/reports')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              Manage in Report Table
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

