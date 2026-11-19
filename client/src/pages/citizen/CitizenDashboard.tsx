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
  const [activeTab, setActiveTab] = useState<'ALL' | 'COLLECTED'>('ALL');

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/reports?limit=50');
      if (res.data?.success) {
        let fetched: Report[] = res.data.data.reports || [];
        try {
          const localCustom = JSON.parse(localStorage.getItem('cleancity_local_reports') || '[]');
          if (Array.isArray(localCustom) && localCustom.length > 0) {
            const existingIds = new Set(fetched.map((r) => r._id));
            const missing = localCustom.filter((cr: Report) => !existingIds.has(cr._id));
            if (missing.length > 0) fetched = [...missing, ...fetched];
          }
        } catch {}
        setReports(fetched);
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

  const displayedReports = activeTab === 'COLLECTED'
    ? reports.filter((r) => r.status === 'COLLECTED')
    : reports;

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
        <Link
          to="/citizen/reports"
          className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500 uppercase">My Total Reports</div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            {reports.length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Submissions from this account</div>
        </Link>

        <Link
          to="/citizen/reports?status=PENDING"
          className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-amber-500 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-amber-600 uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {pendingCount}
          </div>
          <div className="text-xs text-amber-600/80 font-medium mt-1">Click to view pending →</div>
        </Link>

        <Link
          to="/citizen/reports?status=IN_PROGRESS"
          className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            {inProgressCount}
          </div>
          <div className="text-xs text-blue-600/80 font-medium mt-1">Click to view active →</div>
        </Link>

        <Link
          to="/citizen/reports?status=COLLECTED"
          className="bg-white dark:bg-gray-900 p-6 rounded-3xl border-2 border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/20 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolved & Cleaned</span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {collectedCount}
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mt-1">
            See Collected Reports →
          </div>
        </Link>
      </div>

      {/* Submissions Section with Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'COLLECTED' ? 'My Collected & Cleaned Reports' : 'My Recent Waste Reports'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {activeTab === 'COLLECTED'
                ? 'Reports verified and successfully cleared by municipal collection teams'
                : 'All waste reports submitted from your account'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All Reports ({reports.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('COLLECTED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'COLLECTED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Collected ({collectedCount})</span>
              </button>
            </div>

            <Link
              to={activeTab === 'COLLECTED' ? '/citizen/reports?status=COLLECTED' : '/citizen/reports'}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 pl-2"
            >
              <span>Full Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : displayedReports.length === 0 ? (
          <EmptyState
            title={activeTab === 'COLLECTED' ? 'No collected reports yet' : 'No reports submitted yet'}
            description={
              activeTab === 'COLLECTED'
                ? 'Your reported waste hotspots will appear here once our municipal collection crews have cleared and confirmed them.'
                : "You haven't reported any garbage locations yet. Help keep Chennai clean by submitting your first report!"
            }
            actionText="Submit New Report"
            onAction={() => (window.location.href = '/citizen/new')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedReports.slice(0, 6).map((report) => (
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

