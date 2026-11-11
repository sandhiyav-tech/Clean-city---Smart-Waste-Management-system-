import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PublicMapPage } from './pages/PublicMapPage';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { NewReportPage } from './pages/citizen/NewReportPage';
import { MyReportsPage } from './pages/citizen/MyReportsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllReportsPage } from './pages/admin/AllReportsPage';
import { LiveMapPage } from './pages/admin/LiveMapPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { BroadcastPage } from './pages/admin/BroadcastPage';

// Driver Pages
import { DriverTasksPage } from './pages/driver/DriverTasksPage';
import { OptimizedRoutePage } from './pages/driver/OptimizedRoutePage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/map" element={<PublicMapPage />} />

            {/* Citizen Protected Routes */}
            <Route
              path="/citizen"
              element={
                <ProtectedRoute allowedRoles={['CITIZEN']}>
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/new"
              element={
                <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                  <NewReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/reports"
              element={
                <ProtectedRoute allowedRoles={['CITIZEN']}>
                  <MyReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AllReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/map"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <LiveMapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/broadcast"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <BroadcastPage />
                </ProtectedRoute>
              }
            />

            {/* Driver Protected Routes */}
            <Route
              path="/driver"
              element={
                <ProtectedRoute allowedRoles={['DRIVER']}>
                  <DriverTasksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/route"
              element={
                <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN']}>
                  <OptimizedRoutePage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;

