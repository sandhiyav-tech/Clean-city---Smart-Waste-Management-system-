import React, { useEffect, useState, useCallback } from 'react';
import { ReportTable } from '../../components/reports/ReportTable';
import { Report, User } from '../../types';
import axiosClient from '../../api/axiosClient';
import { Search, Filter, RefreshCw } from 'lucide-react';

export const AllReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [wasteTypeFilter, setWasteTypeFilter] = useState('ALL');
  const [driverFilter, setDriverFilter] = useState('');
  const [search, setSearch] = useState('');
  const limit = 10;

  const fetchDrivers = async () => {
    try {
      const res = await axiosClient.get('/users/drivers');
      if (res.data?.success) {
        setDrivers(res.data.data.drivers || []);
      }
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
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
      if (driverFilter) params.append('driverId', driverFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await axiosClient.get(`/reports?${params.toString()}`);
      if (res.data?.success) {
        setReports(res.data.data.reports || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch admin reports:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, wasteTypeFilter, driverFilter, search]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Municipal Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5">
            All Waste Reports
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Search, filter, assign drivers, and manage statuses across Greater Chennai.
          </p>
        </div>

        <button
          onClick={() => fetchReports()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search report, street..."
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

        {/* Driver Filter */}
        <select
          value={driverFilter}
          onChange={(e) => {
            setDriverFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Drivers</option>
          {drivers.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Reports Table with Assign Driver Modal */}
      <ReportTable
        reports={reports}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onRefresh={fetchReports}
        drivers={drivers}
      />
    </div>
  );
};

