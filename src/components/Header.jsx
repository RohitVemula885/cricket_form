import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, ShieldCheck, UserCheck, LogOut, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { isAuthenticated, logout, getAdminUser } from '../utils/auth.js';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = isAuthenticated();
  const adminUser = getAdminUser();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isRegisterPage = location.pathname === '/' || location.pathname === '/register';
  const isAdminDashboard = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand */}
          <Link 
            to="/register" 
            className="flex items-center gap-3 group focus:outline-hidden"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-700/20 group-hover:bg-teal-700 transition-colors">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  NextGen Cricket 
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/60 rounded-full">
                  2026 Match
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Player Registration &amp; Payment Portal
              </p>
            </div>
          </Link>

          {/* Navigation & Actions */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/register"
              id="nav-register-link"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isRegisterPage
                  ? 'bg-teal-50 text-teal-700 border border-teal-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Player Registration
            </Link>

            {isAdmin ? (
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
                <Link
                  to="/admin"
                  id="nav-admin-dashboard-link"
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isAdminDashboard
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Admin Panel</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  id="nav-logout-btn"
                  title="Log out of Admin Dashboard"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                id="nav-admin-login-link"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 sm:border-slate-300"
              >
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Admin Login</span>
              </Link>
            )}
          </nav>

        </div>
      </div>
    </header>
  );
}
