import React, { useEffect, useState } from 'react';
import { LeafletMap } from '../components/map/LeafletMap';
import { Report } from '../types';
import axiosClient from '../api/axiosClient';
import { StatusBadge, WasteBadge } from '../components/common/StatusBadge';
import { MapPin, Calendar, Compass, ShieldCheck } from 'lucide-react';

export const PublicMapPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [wasteTypeFilter, setWasteTypeFilter] = useState('ALL');

  useEffect(() => {
    const params = new URLSearchParams({ limit: '100' });
    if (statusFilter !== 'ALL') params.append('status', statusFilter);
    if (wasteTypeFilter !== 'ALL') params.append('wasteType', wasteTypeFilter);

    axiosClient
      .get(`/reports?${params.toString()}`)
      .then((res) => {
        if (res.data?.success) {
          setReports(res.data.data.reports || []);
        }
      })
      .catch((err) => console.debug('Failed to fetch public map reports:', err));
  }, [statusFilter, wasteTypeFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Citizen Transparency Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5">
            Public Live City Waste Map
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track real-time cleanup activity and waste collection statuses across Greater Chennai.
          </p>
        </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={selectedReport ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <LeafletMap
            reports={reports}
            height="620px"
            onMarkerSelect={(report) => setSelectedReport(report)}
          />
        </div>

        {selectedReport && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 animate-fade-in flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Hotspot Details
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
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Reported {new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 text-center pt-2">
              CleanCity Public Audit Record
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

