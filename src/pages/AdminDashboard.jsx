import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle2, Clock, XCircle, Search, Filter, 
  RotateCcw, ShieldCheck, LogOut, AlertTriangle, 
  Shirt, Phone, Mail, ExternalLink, Calendar, KeyRound, Lock, Check, Eye, EyeOff, X,
  FileText, Loader2, Database, Copy, RefreshCw, Globe, Server, Download
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
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection, 
  getSupabaseClient 
} from '../utils/supabaseClient.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminUser = getAdminUser();

  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tshirtFilter, setTshirtFilter] = useState('All');
  const [isLoadingData, setIsLoadingData] = useState(false);

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

  // Supabase Database Connection Modal states
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbConfig, setDbConfig] = useState(getSupabaseConfig());
  const [dbInputUrl, setDbInputUrl] = useState('');
  const [dbInputKey, setDbInputKey] = useState('');
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState(null);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [pdfDownloadNotice, setPdfDownloadNotice] = useState(null);

  // Load player list from storage / Supabase
  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const data = await getRegistrations();
      setPlayers(data);
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check Supabase config on mount
    const currentConfig = getSupabaseConfig();
    setDbConfig(currentConfig);
    if (currentConfig.url && currentConfig.anonKey) {
      setDbInputUrl(currentConfig.url);
      setDbInputKey(currentConfig.anonKey);
    }

    // Set up Realtime listener if Supabase client is active
    const supabase = getSupabaseClient();
    let channel = null;
    if (supabase) {
      try {
        channel = supabase
          .channel('realtime_admin_registrations')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'registrations' },
            () => {
              loadData();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Supabase realtime error:', err);
      }
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleOpenDbModal = () => {
    const current = getSupabaseConfig();
    setDbConfig(current);
    setDbInputUrl(current.url || '');
    setDbInputKey(current.anonKey || '');
    setDbTestResult(null);
    setIsDbModalOpen(true);
  };

  const handleTestAndSaveDb = async (e) => {
    e.preventDefault();
    setDbTestResult(null);

    if (!dbInputUrl.trim() || !dbInputKey.trim()) {
      setDbTestResult({
        success: false,
        message: 'Please provide both your Supabase Project URL and Public Anon Key.',
      });
      return;
    }

    setIsTestingDb(true);
    try {
      const testRes = await testSupabaseConnection(dbInputUrl.trim(), dbInputKey.trim());
      if (testRes.success) {
        if (testRes.normalizedUrl) {
          setDbInputUrl(testRes.normalizedUrl);
        }
        saveSupabaseConfig(testRes.normalizedUrl || dbInputUrl.trim(), dbInputKey.trim());
        const updatedConfig = getSupabaseConfig();
        setDbConfig(updatedConfig);
        setDbTestResult({
          success: true,
          message: 'Connected successfully! Live registrations sync across all mobile phones is active.',
        });
        // Reload registrations from the connected database
        await loadData();
      } else {
        let msg = testRes.error || 'Failed to connect. Check your URL and Key.';
        if (msg.includes('Invalid path')) {
          msg = 'Invalid Project URL. Make sure it looks like https://your-project-id.supabase.co (do not include /rest/v1 or dashboard paths).';
        }
        setDbTestResult({
          success: false,
          tableMissing: testRes.tableMissing,
          message: msg,
        });
      }
    } catch (err) {
      setDbTestResult({
        success: false,
        message: err.message || 'Error testing Supabase connection.',
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleClearDbConfig = async () => {
    if (window.confirm('Disconnect cloud database and revert to local storage?')) {
      clearSupabaseConfig();
      const updatedConfig = getSupabaseConfig();
      setDbConfig(updatedConfig);
      setDbInputUrl('');
      setDbInputKey('');
      setDbTestResult({
        success: true,
        message: 'Disconnected. Using local browser storage.',
      });
      await loadData();
    }
  };

  const sqlSetupScript = `-- 1. Create registrations table
create table if not exists public.registrations (
  id text primary key,
  full_name text not null,
  mobile text not null,
  email text not null,
  tshirt_size text,
  tshirt_name text,
  tshirt_number text,
  payment_screenshot text,
  payment_status text default 'pending',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add jersey customization columns if table was created previously
alter table public.registrations add column if not exists tshirt_name text;
alter table public.registrations add column if not exists tshirt_number text;

-- 3. Enable Row Level Security (RLS)
alter table public.registrations enable row level security;

-- 4. Drop existing policies if they already exist (safe to re-run anytime)
drop policy if exists "Allow public insert" on public.registrations;
drop policy if exists "Allow public select" on public.registrations;
drop policy if exists "Allow public update" on public.registrations;
drop policy if exists "Allow public delete" on public.registrations;

-- 5. Re-create policies for mobile submissions & admin management
create policy "Allow public insert" on public.registrations
  for insert to anon with check (true);

create policy "Allow public select" on public.registrations
  for select to anon using (true);

create policy "Allow public update" on public.registrations
  for update to anon using (true) with check (true);

create policy "Allow public delete" on public.registrations
  for delete to anon using (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSetupScript);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

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

      const result = generateRegistrationsPDF(listToExport, {
        adminName: adminUser?.name || 'Tournament Director',
      });

      if (result && result.blobUrl) {
        setPdfDownloadNotice({
          fileName: result.fileName,
          blobUrl: result.blobUrl,
          isMobile: result.isMobile,
          recordCount: result.recordCount,
        });
      }
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
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          
          {/* Cloud Database Connection Status Button */}
          <button
            type="button"
            onClick={handleOpenDbModal}
            id="btn-cloud-db-status"
            title="Configure Supabase Cloud Database for cross-device registrations sync"
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              dbConfig.url
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 shadow-2xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${dbConfig.url ? 'text-emerald-600' : 'text-amber-600'}`} />
            <span>{dbConfig.url ? 'Cloud Sync Active' : 'Connect Cloud DB'}</span>
          </button>

          {/* Quick Refresh Button */}
          <button
            type="button"
            onClick={loadData}
            disabled={isLoadingData}
            id="btn-refresh-data"
            title="Refresh registrations from database"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoadingData ? 'animate-spin text-teal-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

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

      {/* Cross-Device Cloud Sync Notice Banner (shown when cloud database is not connected) */}
      {!dbConfig.url && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 shrink-0 mt-0.5 sm:mt-0">
              <Database className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <span>Action Needed: Connect Cloud Database for Mobile Registrations</span>
                <span className="text-2xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/70 font-black text-amber-900">
                  Important
                </span>
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed max-w-3xl">
                Currently running on <strong>Local Browser Storage</strong>. When players submit the registration form from their own mobile phones or via Vercel, their submissions will <strong>not</strong> reach your admin screen until you connect your free Supabase database.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenDbModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>Connect Supabase (1-Min Setup)</span>
          </button>
        </div>
      )}

      {/* PDF Download Ready Banner (Crucial for mobile devices if auto-download was suppressed) */}
      {pdfDownloadNotice && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800 shrink-0">
              <FileText className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-teal-950">
                  PDF Roster Generated ({pdfDownloadNotice.recordCount} Players)
                </h3>
                <span className="text-2xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-200/70 font-black text-teal-900">
                  Ready
                </span>
              </div>
              <p className="text-xs text-teal-800 mt-0.5 font-mono">
                {pdfDownloadNotice.fileName}
              </p>
              <p className="text-xs text-teal-700 mt-1">
                If the download didn&apos;t save automatically on your phone or mobile browser, tap the button below to view or save it.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
            <a
              href={pdfDownloadNotice.blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={pdfDownloadNotice.fileName}
              id="btn-open-save-mobile-pdf"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Open / Save PDF</span>
            </a>
            <button
              type="button"
              onClick={() => setPdfDownloadNotice(null)}
              className="p-2 text-teal-700 hover:text-teal-900 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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

      {/* 11. SUPABASE CLOUD DATABASE & VERCEL SYNC MODAL */}
      {isDbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Cloud Database &amp; Vercel Mobile Sync
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Connect free Supabase to receive all player registrations from any mobile phone
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDbModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Connection Status Badge */}
            <div className="mt-4 p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${dbConfig.url ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-xs font-bold text-slate-800">
                  Status: {dbConfig.url ? 'Connected to Cloud Database' : 'Using Local Storage Only'}
                </span>
                {dbConfig.source && (
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    via {dbConfig.source}
                  </span>
                )}
              </div>

              {dbConfig.url && (
                <button
                  type="button"
                  onClick={handleClearDbConfig}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline cursor-pointer"
                >
                  Disconnect Database
                </button>
              )}
            </div>

            {/* Step-by-Step Guide */}
            <div className="mt-5 space-y-4">
              
              {/* Step 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
                    Step 1: Get Free Supabase Project
                  </span>
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 underline"
                  >
                    <span>Open supabase.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-600">
                  Create a new project at <strong>supabase.com</strong> (100% free, takes 1 minute).
                </p>
              </div>

              {/* Step 2: SQL Script */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
                    Step 2: Run SQL in Supabase SQL Editor
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                  >
                    {sqlCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">SQL Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SQL Script</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  In your Supabase project dashboard, click <strong>SQL Editor</strong> on the left, click <strong>New Query</strong>, paste the script and click <strong>Run</strong>:
                </p>
                <div className="bg-slate-900 rounded-xl p-3 text-slate-200 text-xs font-mono overflow-x-auto max-h-36">
                  <pre>{sqlSetupScript}</pre>
                </div>
              </div>

              {/* Step 3: Enter credentials */}
              <form onSubmit={handleTestAndSaveDb} className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800">
                  Step 3: Enter Supabase Credentials
                </span>

                {dbTestResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium border flex items-start gap-2 ${
                      dbTestResult.success
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {dbTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{dbTestResult.message}</p>
                      {dbTestResult.tableMissing && (
                        <p className="mt-1 text-rose-700">
                          Please copy and run the SQL query from Step 2 above to create the table.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={dbInputUrl}
                    onChange={(e) => setDbInputUrl(e.target.value)}
                    placeholder="https://xxxxxxxxxxxxxxxx.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:border-teal-600 outline-hidden transition-colors"
                  />
                  <p className="text-2xs text-slate-500 mt-1">Found in Project Settings &gt; API &gt; Project URL</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project Anon Public API Key
                  </label>
                  <input
                    type="text"
                    value={dbInputKey}
                    onChange={(e) => setDbInputKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:border-teal-600 outline-hidden transition-colors"
                  />
                  <p className="text-2xs text-slate-500 mt-1">Found in Project Settings &gt; API &gt; Project API keys (anon / public)</p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Saves for this browser immediately.
                  </div>
                  <button
                    type="submit"
                    disabled={isTestingDb}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    {isTestingDb ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Connection...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        <span>Test &amp; Connect Cloud DB</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Vercel Environment Variables Note */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-teal-600" />
                  <span>Deploying to Vercel? Add Environment Variables</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  In your Vercel Dashboard project, go to <strong>Settings &gt; Environment Variables</strong> and add:
                </p>
                <div className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-2xs space-y-1">
                  <div><strong>VITE_SUPABASE_URL</strong> = <em>your project URL</em></div>
                  <div><strong>VITE_SUPABASE_ANON_KEY</strong> = <em>your anon public key</em></div>
                </div>
                <p className="text-2xs text-slate-500">Then redeploy on Vercel so all players accessing via your domain connect to the same database!</p>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDbModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
