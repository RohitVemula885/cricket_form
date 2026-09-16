import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle2, Clock, XCircle, Search, Filter, 
  RotateCcw, ShieldCheck, LogOut, AlertTriangle, 
  Shirt, Phone, Mail, ExternalLink, Calendar, KeyRound, Lock, Check, Eye, EyeOff, X,
  FileText, Loader2
} from 'lucide-react';

import StatCard from '../components/StatCard.jsx';
import PlayerTable from '../components/PlayerTable.jsx';
import PlayerModal from '../components/PlayerModal.jsx';
import { 
  getRegistrations, 
  updateRegistration, 
  deleteRegistration, 
  resetToSampleData 
} from '../utils/storage.js';
import { getAdminUser, logout, getAdminCredentials, updateAdminCredentials, resetAdminCredentials } from '../utils/auth.js';
import { generateRegistrationsPDF } from '../utils/pdfExport.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminUser = getAdminUser();

  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tshirtFilter, setTshirtFilter] = useState('All');

  // Modal states
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Credentials management modal states
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [credsForm, setCredsForm] = useState({ email: '', password: '', name: '' });
  const [credsSuccess, setCredsSuccess] = useState('');
  const [credsError, setCredsError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Load player list from storage
  const loadData = () => {
    const data = getRegistrations();
    setPlayers(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCredsModal = () => {
    const current = getAdminCredentials();
    setCredsForm({
      email: current.email,
      password: current.password,
      name: current.name || 'Tournament Director',
    });
    setCredsSuccess('');
    setCredsError('');
    setShowPassword(false);
    setIsCredsModalOpen(true);
  };

  const handleSaveCredentials = (e) => {
    e.preventDefault();
    setCredsError('');
    setCredsSuccess('');

    if (!credsForm.email.trim()) {
      setCredsError('Please enter an admin email or username.');
      return;
    }
    if (!credsForm.password) {
      setCredsError('Please enter an admin password.');
      return;
    }
    if (credsForm.password.length < 4) {
      setCredsError('Password must be at least 4 characters long.');
      return;
    }

    updateAdminCredentials({
      email: credsForm.email,
      password: credsForm.password,
      name: credsForm.name,
    });

    setCredsSuccess('Admin credentials updated successfully! New login details are now active.');
  };

  const handleResetToDefaultCreds = () => {
    const def = resetAdminCredentials();
    setCredsForm({
      email: def.email,
      password: def.password,
      name: def.name,
    });
    setCredsSuccess('Credentials reset to default: admin@cricket.org / admin123');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Dynamic Statistics
  const stats = useMemo(() => {
    const total = players.length;
    const verified = players.filter((p) => p.paymentStatus === 'verified').length;
    const pending = players.filter((p) => p.paymentStatus === 'pending').length;
    const rejected = players.filter((p) => p.paymentStatus === 'rejected').length;

    return { total, verified, pending, rejected };
  }, [players]);

  // Dynamic Search & Filtering
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // Search matching Name, Mobile, or Email
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        player.fullName.toLowerCase().includes(query) ||
        player.mobile.includes(query) ||
        player.email.toLowerCase().includes(query);

      // Status filter
      const matchesStatus =
        statusFilter === 'All' ||
        player.paymentStatus.toLowerCase() === statusFilter.toLowerCase();

      // T-Shirt filter
      const matchesTshirt =
        tshirtFilter === 'All' ||
        player.tshirtSize === tshirtFilter;

      return matchesSearch && matchesStatus && matchesTshirt;
    });
  }, [players, searchTerm, statusFilter, tshirtFilter]);

  // View Player Modal
  const handleOpenDetails = (player) => {
    setSelectedPlayer(player);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedPlayer(null);
  };

  // Status Update (Verify / Reject)
  const handleUpdateStatus = async (id, newStatus) => {
    const updated = await updateRegistration(id, { paymentStatus: newStatus });
    if (updated) {
      // Update local state
      setPlayers((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      // Update modal view
      setSelectedPlayer(updated);
    }
  };

  // Delete Player confirmation
  const handleOpenDeleteConfirm = (player) => {
    setPlayerToDelete(player);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!playerToDelete) return;

    await deleteRegistration(playerToDelete.id);
    setPlayers((prev) => prev.filter((p) => p.id !== playerToDelete.id));

    if (selectedPlayer?.id === playerToDelete.id) {
      setIsDetailsModalOpen(false);
      setSelectedPlayer(null);
    }

    setIsDeleteModalOpen(false);
    setPlayerToDelete(null);
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset registration list to default sample players?')) {
      const reset = resetToSampleData();
      setPlayers(reset);
      setSearchTerm('');
      setStatusFilter('All');
      setTshirtFilter('All');
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Download Comprehensive Player Roster as PDF
  const handleDownloadPDF = async () => {
    // If filter/search is active, export the filtered view, otherwise all players
    const listToExport = filteredPlayers.length > 0 ? filteredPlayers : players;

    if (listToExport.length === 0) {
      alert('No player registrations found to generate PDF.');
      return;
    }

    try {
      setIsExportingPdf(true);
      // Small tick so UI shows loading feedback
      await new Promise((resolve) => setTimeout(resolve, 80));

      generateRegistrationsPDF(listToExport, {
        adminName: adminUser?.name || 'Tournament Director',
      });
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      alert('Could not generate PDF roster. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      
      {/* 5. TOP HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Player Registration Dashboard
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Manage registrations, verify UPI payment receipts, and allocate match rosters
          </p>
        </div>

        {/* Admin profile/login information & actions */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-slate-800 leading-tight">
                {adminUser?.name || 'Tournament Director'}
              </div>
              <div className="text-slate-400 font-medium">
                {adminUser?.email || 'admin@cricket.org'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenCredsModal}
            id="btn-change-credentials"
            title="Change Admin username, password, or profile name"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Change Password</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExportingPdf || players.length === 0}
            id="btn-download-pdf"
            title="Download official player registrations and payment roster as PDF"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed border border-teal-700/30 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-teal-100" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            id="btn-admin-logout"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 5. STATISTICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <StatCard
          title="Total Players"
          value={stats.total}
          subtitle="Registered athletes"
          icon={Users}
          variant="slate"
          isActive={statusFilter === 'All'}
          onClick={() => setStatusFilter('All')}
        />

        <StatCard
          title="Verified Payments"
          value={stats.verified}
          subtitle="Approved by admin"
          icon={CheckCircle2}
          variant="teal"
          isActive={statusFilter === 'Verified'}
          onClick={() => setStatusFilter('Verified')}
        />

        <StatCard
          title="Pending Payments"
          value={stats.pending}
          subtitle="Awaiting manual review"
          icon={Clock}
          variant="amber"
          isActive={statusFilter === 'Pending'}
          onClick={() => setStatusFilter('Pending')}
        />

        <StatCard
          title="Rejected Payments"
          value={stats.rejected}
          subtitle="Requires resubmission"
          icon={XCircle}
          variant="rose"
          isActive={statusFilter === 'Rejected'}
          onClick={() => setStatusFilter('Rejected')}
        />
      </div>

      {/* 7. SEARCH AND FILTER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Player Name, Mobile (e.g. 9876543210), or Email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-hidden transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="status-filter" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 outline-hidden focus:border-teal-600 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* T-Shirt Size Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="tshirt-filter" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                T-Shirt:
              </label>
              <select
                id="tshirt-filter"
                value={tshirtFilter}
                onChange={(e) => setTshirtFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 outline-hidden focus:border-teal-600 cursor-pointer"
              >
                <option value="All">All Sizes</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            {/* Reset Filters button */}
            {(searchTerm || statusFilter !== 'All' || tshirtFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setTshirtFilter('All');
                }}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-xl border border-teal-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetSampleData}
              title="Reset records to default sample demo data"
              className="text-xs text-slate-400 hover:text-slate-600 underline font-medium ml-auto"
            >
              Reset Sample Data
            </button>
          </div>

        </div>

        {/* Active Filter Count Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredPlayers.length}</strong> of{' '}
            <strong className="text-slate-800">{players.length}</strong> registrations
          </span>

          {(statusFilter !== 'All' || tshirtFilter !== 'All' || searchTerm) && (
            <span className="text-teal-700 font-medium">Filtered Results Active</span>
          )}
        </div>
      </div>

      {/* 6. PLAYER TABLE COMPONENT */}
      <PlayerTable
        players={filteredPlayers}
        onViewDetails={handleOpenDetails}
        onDeletePlayer={handleOpenDeleteConfirm}
      />

      {/* 8. PLAYER DETAILS MODAL */}
      <PlayerModal
        player={selectedPlayer}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* 9. DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && playerToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center">
              Are you sure you want to delete this registration?
            </h3>

            <p className="text-sm text-slate-500 text-center mt-2">
              This will permanently delete the registration record and payment screenshot for{' '}
              <strong className="text-slate-800 font-semibold">{playerToDelete.fullName}</strong> ({playerToDelete.id}).
            </p>

            <div className="flex items-center justify-center gap-3 mt-6 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setPlayerToDelete(null);
                }}
                className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                id="btn-confirm-delete"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. CHANGE ADMIN CREDENTIALS MODAL */}
      {isCredsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div 
            className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Admin Credentials</h3>
                  <p className="text-xs text-slate-500">Update the username, email, and password for admin access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCredsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveCredentials} className="p-6 space-y-4">
              {credsSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs font-semibold text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{credsSuccess}</span>
                </div>
              )}

              {credsError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs font-semibold text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{credsError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Organizer / Admin Name
                </label>
                <input
                  type="text"
                  value={credsForm.name}
                  onChange={(e) => setCredsForm({ ...credsForm, name: e.target.value })}
                  placeholder="e.g. Tournament Director"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-teal-600 outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Admin Username / Email Address
                </label>
                <input
                  type="text"
                  value={credsForm.email}
                  onChange={(e) => setCredsForm({ ...credsForm, email: e.target.value })}
                  placeholder="e.g. admin@cricket.org or your custom email"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-teal-600 outline-hidden transition-colors"
                />
                <p className="text-2xs text-slate-400 mt-1">This email or username is used to log in at /admin/login</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credsForm.password}
                    onChange={(e) => setCredsForm({ ...credsForm, password: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-teal-600 outline-hidden transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-2xs text-slate-400 mt-1">Minimum 4 characters</p>
              </div>

              {/* Actions */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetToDefaultCreds}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                >
                  Reset to Default (admin@cricket.org / admin123)
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCredsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    Save Credentials
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
