import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Register from './pages/Register.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        {/* Navigation Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            {/* Public Player Registration */}
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Private Admin Dashboard protected by ProtectedRoute */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect to /register */}
            <Route path="*" element={<Navigate to="/register" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 NextGen Cricket League Match. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span>Organized with Fair Play &amp; Sportsmanship</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
