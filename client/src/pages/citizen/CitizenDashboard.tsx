import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Report } from '../../types';
import axiosClient from '../../api/axiosClient';
import { PlusCircle, Clock, Truck, CheckCircle2, AlertCircle, ArrowRight, History } from 'lucide-react';
import { StatusBadge, WasteBadge } from '../../components/common/StatusBadge';
import { StatusTimelineModal } from '../../components/reports/StatusTimeline';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/reports?limit=10');
      if (res.data?.success) {
        setReports(res.data.data.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
  const inProgressCount = reports.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length;
  const collectedCount = reports.filter((r) => r.status === 'COLLECTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Action Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
            Citizen Action Hub
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold mt-1">
            Hello, {user?.name || 'Citizen'}!
          </h1>
          <p className="mt-2 text-sm text-emerald-100 max-w-xl">
            Spot garbage in your neighborhood? Report it immediately with a geotagged photo. Our municipal drivers will be dispatched along optimized routes.
          </p>
        </div>
        <Link
          to="/citizen/new"
          className="px-6 py-3.5 rounded-2xl font-bold bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <span>Report Garbage Now</span>
        </Link>
      </div>

      {/* Stats KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase">My Total Reports</div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {reports.length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Submissions from this account</div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs font-bold text-amber-600 uppercase">Pending Review</div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {pendingCount}
          </div>
          <div className="text-xs text-gray-400 mt-1">Awaiting driver assignment</div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs font-bold text-blue-600 uppercase">Assigned / In Progress</div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            {inProgressCount}
          </div>
          <div className="text-xs text-gray-400 mt-1">Driver en route to location</div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs font-bold text-emerald-600 uppercase">Resolved & Cleaned</div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {collectedCount}
          </div>
          <div className="text-xs text-gray-400 mt-1">Successfully collected</div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            My Recent Waste Reports
          </h2>
          <Link
            to="/citizen/reports"
            className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            title="No reports submitted yet"
            description="You haven't reported any garbage locations yet. Help keep Chennai clean by submitting your first report!"
            actionText="Submit First Report"
            onAction={() => (window.location.href = '/citizen/new')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.slice(0, 4).map((report) => (
              <div
                key={report._id}
                className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-colors"
              >
                <div className="flex gap-4">
                  {report.imageUrl ? (
                    <img
                      src={report.imageUrl}
                      alt=""
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-gray-100 dark:border-gray-800"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400 shrink-0">
                      No Photo
                    </div>
                  )}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <StatusBadge status={report.status} size="sm" />
                      <WasteBadge wasteType={report.wasteType} size="sm" />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                      {report.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {report.location?.address}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                  <span>Reported {new Date(report.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setTimelineOpen(true);
                    }}
                    className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View Timeline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReport && (
        <StatusTimelineModal
          isOpen={timelineOpen}
          onClose={() => setTimelineOpen(false)}
          reportTitle={selectedReport.title}
          statusHistory={selectedReport.statusHistory}
        />
      )}
    </div>
  );
};

