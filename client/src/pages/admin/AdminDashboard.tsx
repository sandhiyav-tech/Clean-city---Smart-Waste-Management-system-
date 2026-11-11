import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { SystemStats } from '../../types';
import axiosClient from '../../api/axiosClient';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Map,
  Users,
  Radio,
  FileText,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CardSkeleton } from '../../components/common/Skeleton';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: '#f59e0b',
    ASSIGNED: '#3b82f6',
    IN_PROGRESS: '#8b5cf6',
    COLLECTED: '#10b981',
  };

  const wasteTypeColors: Record<string, string> = {
    ORGANIC: '#84cc16',
    PLASTIC: '#f59e0b',
    METAL: '#64748b',
    'E-WASTE': '#6366f1',
    HAZARDOUS: '#f43f5e',
    MIXED: '#14b8a6',
  };

  const statusPieData = stats?.statusBreakdown
    ? [
        { name: 'Pending', value: stats.statusBreakdown.PENDING, color: statusColors.PENDING },
        { name: 'Assigned', value: stats.statusBreakdown.ASSIGNED, color: statusColors.ASSIGNED },
        { name: 'In Progress', value: stats.statusBreakdown.IN_PROGRESS, color: statusColors.IN_PROGRESS },
        { name: 'Collected', value: stats.statusBreakdown.COLLECTED, color: statusColors.COLLECTED },
      ].filter((d) => d.value > 0)
    : [];

  const wasteTypePieData = stats?.wasteTypeBreakdown
    ? Object.entries(stats.wasteTypeBreakdown)
        .map(([key, count]) => ({
          name: key,
          value: count,
          color: wasteTypeColors[key] || '#10b981',
        }))
        .filter((d) => d.value > 0)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Municipal Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5">
            Chennai Waste Analytics & Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time municipal performance metrics, collection velocity, and hotspot distribution.
          </p>
        </div>

        {/* Quick action shortcuts */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/map"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
          >
            <Map className="w-4 h-4" />
            <span>Live Map</span>
          </Link>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Manage Reports</span>
          </Link>
          <Link
            to="/admin/broadcast"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all"
          >
            <Radio className="w-4 h-4 text-rose-500" />
            <span>Broadcast</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      {loading || !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Reports</div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
              {stats.totalReports}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Chennai Metropolitan Grid</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Hotspots</div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
              {stats.statusBreakdown.PENDING}
            </div>
            <div className="text-xs text-gray-400 mt-1">Requires driver dispatch</div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Cleared & Collected</div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
              {stats.statusBreakdown.COLLECTED}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {stats.totalReports > 0
                ? `${Math.round((stats.statusBreakdown.COLLECTED / stats.totalReports) * 100)}% resolution rate`
                : '0%'}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Avg. Collection Time</div>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
              {stats.avgCollectionHours} hrs
            </div>
            <div className="text-xs text-gray-400 mt-1">Time from report to compactor</div>
          </div>
        </div>
      )}

      {/* Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports per day BarChart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                Daily Waste Reports (Recent Trend)
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Citizen submissions recorded over time</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {stats?.reportsPerDay && stats.reportsPerDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.reportsPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" stroke="#888888" fontSize={12} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="Reports" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No recent daily data available.
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution PieChart (1 col) */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
              Status Breakdown
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Current workflow status distribution</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-400">No status data to plot.</div>
            )}
          </div>
        </div>

        {/* Waste Category Breakdown (Full Width / 3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                Waste Category Breakdown
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Segregation analysis across Organic, Plastic, Metal, E-Waste, Hazardous, and Mixed
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Helps plan specialized recycling trucks
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats?.wasteTypeBreakdown &&
              Object.entries(stats.wasteTypeBreakdown).map(([category, count]) => {
                const color = wasteTypeColors[category] || '#10b981';
                const percentage =
                  stats.totalReports > 0 ? Math.round((count / stats.totalReports) * 100) : 0;

                return (
                  <div
                    key={category}
                    className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {category}
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {count}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-gray-400">{percentage}% of all reports</div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

