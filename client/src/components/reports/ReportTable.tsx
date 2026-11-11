import React, { useState } from 'react';
import { Report, WasteType, ReportStatus, User } from '../../types';
import { StatusBadge, WasteBadge } from '../common/StatusBadge';
import { StatusTimelineModal } from './StatusTimeline';
import {
  Search,
  Filter,
  History,
  UserCheck,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import axiosClient from '../../api/axiosClient';

interface ReportTableProps {
  reports: Report[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onRefresh: () => void;
  drivers?: User[];
}

export const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  loading,
  total,
  page,
  limit,
  onPageChange,
  onRefresh,
  drivers = [],
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  // Driver Assignment modal state (Admin)
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reportToAssign, setReportToAssign] = useState<Report | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Status Update modal state (Admin / Driver)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [reportToUpdate, setReportToUpdate] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>('IN_PROGRESS');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const openTimeline = (report: Report) => {
    setSelectedReport(report);
    setTimelineOpen(true);
  };

  const openAssignModal = (report: Report) => {
    setReportToAssign(report);
    setSelectedDriverId(report.assignedDriver?._id || (drivers[0]?._id ?? ''));
    setAssignModalOpen(true);
  };

  const handleAssignDriver = async () => {
    if (!reportToAssign || !selectedDriverId) return;
    setAssigning(true);
    try {
      await axiosClient.patch(`/reports/${reportToAssign._id}/assign`, {
        driverId: selectedDriverId,
      });
      toast('Driver assigned successfully!', 'success');
      setAssignModalOpen(false);
      onRefresh();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to assign driver', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const openStatusModal = (report: Report) => {
    setReportToUpdate(report);
    setNewStatus(report.status === 'ASSIGNED' ? 'IN_PROGRESS' : 'COLLECTED');
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!reportToUpdate) return;
    setUpdatingStatus(true);
    try {
      await axiosClient.patch(`/reports/${reportToUpdate._id}/status`, {
        status: newStatus,
        note: statusNote || undefined,
      });
      toast(`Status updated to ${newStatus}`, 'success');
      setStatusModalOpen(false);
      onRefresh();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this waste report?')) return;
    try {
      await axiosClient.delete(`/reports/${reportId}`);
      toast('Report deleted successfully', 'success');
      onRefresh();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to delete report', 'error');
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/75 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="py-4 px-6">Report</th>
              <th className="py-4 px-4">Waste Type</th>
              <th className="py-4 px-4">Location</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Driver</th>
              <th className="py-4 px-4">Reported</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-40 mb-1"></div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-24"></div>
                  </td>
                  <td className="py-4 px-4"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md w-16"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div></td>
                  <td className="py-4 px-4"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div></td>
                  <td className="py-4 px-6 text-right"><div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-gray-500">
                  No waste reports found matching your criteria.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr
                  key={report._id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  {/* Report details */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {report.imageUrl ? (
                        <img
                          src={report.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-gray-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center text-gray-400 text-xs">
                          No Pic
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white line-clamp-1">
                          {report.title}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
                          By {report.user?.name || 'Citizen'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Waste type */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <WasteBadge wasteType={report.wasteType} size="sm" />
                  </td>

                  {/* Location */}
                  <td className="py-4 px-4">
                    <div className="text-xs text-gray-700 dark:text-gray-300 max-w-xs line-clamp-2">
                      {report.location?.address || 'Chennai'}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge status={report.status} size="sm" />
                  </td>

                  {/* Driver */}
                  <td className="py-4 px-4 whitespace-nowrap text-xs">
                    {report.assignedDriver ? (
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {report.assignedDriver.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Reported Date */}
                  <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Timeline button */}
                      <button
                        onClick={() => openTimeline(report)}
                        title="View Status Timeline"
                        className="p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      {/* Admin: Assign Driver */}
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => openAssignModal(report)}
                          title="Assign Driver"
                          className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}

                      {/* Admin / Driver: Update Status */}
                      {(user?.role === 'ADMIN' || user?.role === 'DRIVER') && (
                        <button
                          onClick={() => openStatusModal(report)}
                          title="Update Status"
                          className="p-2 rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete (Admin or Creator) */}
                      {(user?.role === 'ADMIN' || (user?.role === 'CITIZEN' && user?._id === report.user?._id)) && (
                        <button
                          onClick={() => handleDeleteReport(report._id)}
                          title="Delete Report"
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        <div>
          Showing {reports.length > 0 ? (page - 1) * limit + 1 : 0} to{' '}
          {Math.min(page * limit, total)} of {total} reports
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Timeline Modal */}
      {selectedReport && (
        <StatusTimelineModal
          isOpen={timelineOpen}
          onClose={() => setTimelineOpen(false)}
          reportTitle={selectedReport.title}
          statusHistory={selectedReport.statusHistory}
        />
      )}

      {/* Driver Assignment Modal */}
      {assignModalOpen && reportToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full border border-gray-100 dark:border-gray-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Assign Municipal Driver
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Assigning will notify the driver and the citizen that collection is scheduled.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Select Driver
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                {drivers.length === 0 ? (
                  <option value="">No drivers found in system</option>
                ) : (
                  drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.phone || d.email})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignDriver}
                disabled={assigning || !selectedDriverId}
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalOpen && reportToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full border border-gray-100 dark:border-gray-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Update Collection Status
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              For report: <strong className="font-semibold text-gray-800 dark:text-gray-200">{reportToUpdate.title}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Driver en route)</option>
                <option value="COLLECTED">COLLECTED (Waste cleared)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Operational Note (Optional)
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={2}
                placeholder="e.g. Cleared 2 bags of plastic bottles, loaded into compactor #4"
                className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {updatingStatus ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

