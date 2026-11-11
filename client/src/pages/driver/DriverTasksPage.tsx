import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Report, ReportStatus } from '../../types';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../components/common/Toast';
import { StatusBadge, WasteBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Clock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const DriverTasksPage: React.FC = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/reports?limit=50');
      if (res.data?.success) {
        setTasks(res.data.data.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch driver tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus) => {
    setUpdatingId(reportId);
    try {
      await axiosClient.patch(`/reports/${reportId}/status`, {
        status: newStatus,
        note: `Updated by driver to ${newStatus}`,
      });
      toast(`Pickup stop marked as ${newStatus}!`, 'success');
      setTasks((prev) =>
        prev.map((t) => (t._id === reportId ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update task', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeTasks = tasks.filter((t) => t.status !== 'COLLECTED');
  const completedTasks = tasks.filter((t) => t.status === 'COLLECTED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            EcoDriver Route Control
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold mt-1">
            My Assigned Pickups
          </h1>
          <p className="mt-2 text-sm text-purple-200/90 max-w-xl">
            You currently have <strong className="text-white font-bold">{activeTasks.length} pending pickups</strong> in your sector. View your 2-Opt optimized route for the shortest driving path.
          </p>
        </div>

        <Link
          to="/driver/route"
          className="px-6 py-3.5 rounded-2xl font-bold bg-white text-purple-900 hover:bg-purple-50 active:scale-95 transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Navigation className="w-5 h-5 text-purple-600" />
          <span>Open 2-Opt Route Map</span>
        </Link>
      </div>

      {/* Task Summary Badges */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <span>Active Stops: <strong className="text-purple-600">{activeTasks.length}</strong></span>
          <span>•</span>
          <span>Cleared Today: <strong className="text-emerald-600">{completedTasks.length}</strong></span>
        </div>

        <button
          onClick={fetchTasks}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No pickups assigned yet"
          description="You currently have no waste pickups assigned to your account. Check back shortly as municipal administrators dispatch new hotspots."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isDone = task.status === 'COLLECTED';
            return (
              <div
                key={task._id}
                className={`bg-white dark:bg-gray-900 rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                  isDone
                    ? 'border-emerald-200 dark:border-emerald-900/40 opacity-75'
                    : 'border-gray-200 dark:border-gray-800 shadow-sm hover:border-purple-500'
                }`}
              >
                <div className="space-y-4">
                  {task.imageUrl && (
                    <img
                      src={task.imageUrl}
                      alt=""
                      className="w-full h-44 object-cover rounded-2xl border border-gray-100 dark:border-gray-800"
                    />
                  )}

                  <div className="flex items-center justify-between gap-1">
                    <StatusBadge status={task.status} size="sm" />
                    <WasteBadge wasteType={task.wasteType} size="sm" />
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">
                      {task.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{task.location.address}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                  {task.status !== 'IN_PROGRESS' && task.status !== 'COLLECTED' && (
                    <button
                      type="button"
                      disabled={updatingId === task._id}
                      onClick={() => handleUpdateStatus(task._id, 'IN_PROGRESS')}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
                    >
                      En Route
                    </button>
                  )}

                  {task.status !== 'COLLECTED' ? (
                    <button
                      type="button"
                      disabled={updatingId === task._id}
                      onClick={() => handleUpdateStatus(task._id, 'COLLECTED')}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Collected</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                      ✓ Cleared and Collected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

