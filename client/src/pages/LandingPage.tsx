import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Recycle,
  MapPin,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import axiosClient from '../api/axiosClient';
import { SystemStats } from '../types';

export const LandingPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loggingInAs, setLoggingInAs] = useState<string | null>(null);

  useEffect(() => {
    // Fetch live system stats for landing counter
    axiosClient
      .get('/stats')
      .then((res) => {
        if (res.data?.success) {
          setStats(res.data.data);
        }
      })
      .catch((err) => console.debug('Failed to fetch public stats:', err));
  }, []);

  const handleQuickDemoLogin = async (role: 'ADMIN' | 'DRIVER' | 'CITIZEN') => {
    const creds = {
      ADMIN: { email: 'admin@cleancity.com', password: 'Admin@123' },
      DRIVER: { email: 'driver@cleancity.com', password: 'Driver@123' },
      CITIZEN: { email: 'citizen@cleancity.com', password: 'Citizen@123' },
    }[role];

    setLoggingInAs(role);
    try {
      const loggedUser = await login(creds);
      toast(`Welcome, ${loggedUser.name}! Signed in as ${role}.`, 'success');

      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'DRIVER') navigate('/driver');
      else navigate('/citizen');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Login failed. Please run seed script first.', 'error');
    } finally {
      setLoggingInAs(null);
    }
  };

  return (
    <div className="space-y-24 py-8 sm:py-16">
      {/* 1. Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eco Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Next-Generation Municipal Waste Infrastructure</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Cleaner Streets, Smarter Cities with{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 bg-clip-text text-transparent">
            CleanCity
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Empowering citizens to pinpoint waste hotspots, municipal teams to coordinate collections, and green drivers to navigate 2-Opt optimized routes.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? (user?.role === 'ADMIN' ? '/admin' : user?.role === 'DRIVER' ? '/driver' : '/citizen/new') : '/signup'}
            className="px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-600/25 active:scale-95 transition-all flex items-center gap-2 group"
          >
            <span>{isAuthenticated ? 'Go to My Dashboard' : 'Get Started Free'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/map"
            className="px-8 py-4 rounded-2xl font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
          >
            <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Explore City Live Map</span>
          </Link>
        </div>

        {/* One-Click Quick Demo Login Section */}
        <div className="mt-12 max-w-2xl mx-auto bg-gradient-to-b from-white to-emerald-50/40 dark:from-gray-900 dark:to-gray-900/60 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-950 shadow-md">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>Instant Demo Sign-In (One-Click)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickDemoLogin('ADMIN')}
              disabled={!!loggingInAs}
              className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition-all group shadow-sm disabled:opacity-50"
            >
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-0.5">Admin Role</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Municipal HQ</div>
              <div className="text-[10px] text-gray-400 mt-1">Full control & analytics</div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('DRIVER')}
              disabled={!!loggingInAs}
              className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition-all group shadow-sm disabled:opacity-50"
            >
              <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-0.5">Driver Role</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">EcoDriver #1</div>
              <div className="text-[10px] text-gray-400 mt-1">2-Opt routes & pickups</div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('CITIZEN')}
              disabled={!!loggingInAs}
              className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition-all group shadow-sm disabled:opacity-50"
            >
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">Citizen Role</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Ananya Sharma</div>
              <div className="text-[10px] text-gray-400 mt-1">Report garbage & track</div>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Live Municipal Impact Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              {stats ? stats.statusBreakdown?.COLLECTED ?? 0 : '14+'}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
              Waste Sites Cleared
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              {stats ? `${stats.avgCollectionHours}h` : '3.8h'}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
              Avg. Turnaround Time
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              {stats ? stats.users?.byRole?.DRIVER ?? 2 : '2'}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
              Active Eco-Drivers
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-3">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              {stats ? stats.totalReports ?? 20 : '20'}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
              Chennai Total Reports
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Integrated Roles Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            A Unified Ecosystem
          </h2>
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            Built for Every Stakeholder in the Urban Grid
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. Citizen */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-colors group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">1. Citizens</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Take a photo, drop a pin on the interactive Leaflet map, categorize the waste type, and monitor the resolution audit trail in real time with SMS/in-app notifications.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>One-tap current GPS location</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Transparent 4-stage audit history</span>
                </li>
              </ul>
            </div>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline"
            >
              Sign Up as Citizen <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2. Municipal Admin */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:border-blue-500 transition-colors group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">2. Municipal Admins</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Bird’s eye command center with interactive heatmaps, Recharts analytics, smart driver workload dispatch, and city-wide public service broadcast announcements.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Aggregated waste breakdown analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Driver fleet assignment and role control</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline"
            >
              Access Admin Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3. Driver */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:border-purple-500 transition-colors group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">3. Green Drivers</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Equipped with automated 2-Opt Traveling Salesperson route optimization that calculates the shortest fuel-efficient trajectory across all assigned garbage stops.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Turn-by-turn stop sequence & total km</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>One-click 'Mark Collected' updates</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-purple-600 dark:text-purple-400 group-hover:underline"
            >
              Driver Operations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. How It Works Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
              Automated Lifecycle
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              From Citizen Pin to Cleared Ground in 4 Steps
            </h3>
            <p className="mt-4 text-sm sm:text-base text-emerald-100/80 leading-relaxed">
              Every report automatically enters our real-time geospatial processing queue, notifying drivers, informing citizens, and optimizing collection paths.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                <div className="text-xs font-bold text-emerald-300 mb-1">Step 01</div>
                <div className="font-bold text-lg mb-1">Citizen Reports</div>
                <p className="text-xs text-emerald-100/70">Geotagged image submission with waste type classification.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                <div className="text-xs font-bold text-emerald-300 mb-1">Step 02</div>
                <div className="font-bold text-lg mb-1">Admin Dispatches</div>
                <p className="text-xs text-emerald-100/70">Review reports on the live map and assign to sector drivers.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                <div className="text-xs font-bold text-emerald-300 mb-1">Step 03</div>
                <div className="font-bold text-lg mb-1">2-Opt Optimization</div>
                <p className="text-xs text-emerald-100/70">Algorithm arranges stops for minimum km and lowest emissions.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                <div className="text-xs font-bold text-emerald-300 mb-1">Step 04</div>
                <div className="font-bold text-lg mb-1">Collection & Audit</div>
                <p className="text-xs text-emerald-100/70">Driver marks collected; citizen receives instant notification.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
