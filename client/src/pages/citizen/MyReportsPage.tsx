import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ReportTable } from '../../components/reports/ReportTable';
import { Report, ReportStatus, WasteType } from '../../types';
import axiosClient from '../../api/axiosClient';
import { PlusCircle, Search, Filter, CheckCircle2, Clock, Truck, Layers } from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [wasteTypeFilter, setWasteTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const limit = 10;

  // Sync with searchParams if URL changes
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
      setPage(1);
    }
  }, [searchParams]);

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
    if (newStatus === 'ALL') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), status: newStatus });
    }
  };

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (wasteTypeFilter !== 'ALL') params.append('wasteType', wasteTypeFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await axiosClient.get(`/reports?${params.toString()}`);
      if (res.data?.success) {
        let fetchedReports: Report[] = res.data.data.reports || [];
        try {
          const localCustom = JSON.parse(localStorage.getItem('cleancity_local_reports') || '[]');
          if (Array.isArray(localCustom) && localCustom.length > 0) {
            const existingIds = new Set(fetchedReports.map((r) => r._id));
            const missing = localCustom.filter((cr: Report) => !existingIds.has(cr._id));
            if (missing.length > 0) {
              fetchedReports = [...missing, ...fetchedReports];
            }
          }
        } catch { }

        try {
          const overrides = JSON.parse(localStorage.getItem('cleancity_status_overrides') || '{}');
          if (overrides && Object.keys(overrides).length > 0) {
            fetchedReports = fetchedReports.map((r) =>
              overrides[r._id] ? { ...r, status: overrides[r._id] } : r
            );
          }
        } catch { }

        try {
          const deletedIds = new Set(JSON.parse(localStorage.getItem('cleancity_deleted_ids') || '[]'));
          fetchedReports = fetchedReports.filter((r) => !deletedIds.has(r._id));
        } catch { }

        if (statusFilter !== 'ALL') {
          fetchedReports = fetchedReports.filter((r) => r.status === statusFilter);
        }
        if (wasteTypeFilter !== 'ALL') {
          fetchedReports = fetchedReports.filter((r) => r.wasteType === wasteTypeFilter);
        }

        setReports(fetchedReports);
        setTotal(res.data.data.pagination?.total || fetchedReports.length);
      }
    } catch (err) {
      console.error('Failed to fetch my reports:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, wasteTypeFilter, search]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Audit & Status
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5">
            My Waste Reports
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track cleanup progress, driver assignments, and verified collected reports.
          </p>
        </div>
        <Link
          to="/citizen/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Report</span>
        </Link>
      </div>

      {/* Quick Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleStatusFilterChange('ALL')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${statusFilter === 'ALL'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Reports</span>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilterChange('COLLECTED')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${statusFilter === 'COLLECTED'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
            }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Collected & Resolved</span>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilterChange('IN_PROGRESS')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${statusFilter === 'IN_PROGRESS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800'
            }`}
        >
          <Truck className="w-3.5 h-3.5 text-blue-500" />
          <span>In Progress</span>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilterChange('PENDING')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${statusFilter === 'PENDING'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
            }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Pending Review</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, description, or street..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="COLLECTED">Collected & Resolved</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="PENDING">Pending</option>
        </select>

        {/* Waste Type Filter */}
        <select
          value={wasteTypeFilter}
          onChange={(e) => {
            setWasteTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
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

      {/* Reports Table */}
      <ReportTable
        reports={reports}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onRefresh={fetchReports}
      />
    </div>
  );
};

