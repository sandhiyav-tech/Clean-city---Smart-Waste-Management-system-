import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ReportTable } from '../../components/reports/ReportTable';
import { Report, ReportStatus, WasteType } from '../../types';
import axiosClient from '../../api/axiosClient';
import { PlusCircle, Search, Filter } from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [wasteTypeFilter, setWasteTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const limit = 10;

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
        setReports(res.data.data.reports || []);
        setTotal(res.data.data.pagination?.total || 0);
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
            Track the cleanup progress and driver assignments for all your submitted reports.
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
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COLLECTED">Collected</option>
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

