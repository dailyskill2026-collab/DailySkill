// src/screens/Admin/AdminDashboardScreen.tsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Eye,
  TrendingUp,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  BarChart3,
  Flame,
  FileSpreadsheet,
  ExternalLink,
  RotateCw,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { userRegistryService, RegisteredCandidate } from '@/services/userRegistryService';
import { dailyReleaseFeed } from '@/data/dailyReleaseFeed';
import { repositories } from '@/repositories';
import { useAuth } from '@/contexts/AuthContext';

// Lazy-load AI Generation Screen so its bundle is loaded on demand
const GenerationScreen = lazy(() => import('@/screens/Admin/GenerationScreen'));

// Safe date and time formatters that never throw RangeError
const formatDate = (isoString?: string): string => {
  if (!isoString) return 'Recent';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Recent';
  }
};

const formatTime = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export default function AdminDashboardScreen() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'releases' | 'ai_studio'>('users');

  // Candidate Registry state
  const [candidates, setCandidates] = useState<RegisteredCandidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedVerification, setSelectedVerification] = useState('All');
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    activeToday: 0,
    totalOpens: 0,
  });

  // Notice banner
  const [notice, setNotice] = useState<string | null>(null);

  // New Candidate Modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Developer');
  const [newUserExp, setNewUserExp] = useState('Mid (3–5 yrs)');

  // Telemetry events
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const list = userRegistryService.getAllCandidates();
      setCandidates(Array.isArray(list) ? list : []);
      const regStats = userRegistryService.getRegistryStats();
      if (regStats) {
        setStats({
          totalUsers: regStats.totalUsers || 0,
          verifiedUsers: regStats.verifiedUsers || 0,
          activeToday: regStats.activeToday || 1,
          totalOpens: regStats.totalOpens || regStats.totalAppOpens || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load candidate registry:', err);
    }

    // Safely fetch analytics events
    try {
      if (repositories && repositories.analytics && typeof repositories.analytics.getEvents === 'function') {
        repositories.analytics
          .getEvents()
          .then((evts) => {
            if (Array.isArray(evts)) {
              const sorted = [...evts].sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
              setRecentEvents(sorted.slice(0, 30));
            }
          })
          .catch((err) => {
            console.warn('Analytics events load error:', err);
          });
      }
    } catch (err) {
      console.warn('Analytics unavailable:', err);
    }
  };

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleExportCSV = () => {
    try {
      const csvContent = userRegistryService.exportCandidatesToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registered_candidates_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotice('Exported candidates to CSV successfully!');
    } catch {
      showNotice('Could not generate CSV export.');
    }
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;

    try {
      userRegistryService.registerOrUpdateCandidate({
        uid: `user-admin-add-${Date.now()}`,
        name: newUserName.trim() || newUserEmail.split('@')[0],
        email: newUserEmail.trim(),
        technology: 'SALESFORCE',
        role: newUserRole,
        experience: newUserExp,
        dailyDuration: 5,
        emailVerified: true,
      });

      setIsAddUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      loadData();
      showNotice(`Candidate ${newUserEmail} registered successfully!`);
    } catch (err: any) {
      showNotice(err.message || 'Error registering candidate.');
    }
  };

  const handleDeleteCandidate = (uid: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove candidate "${name}"?`)) {
      userRegistryService.deleteCandidate(uid);
      loadData();
      showNotice(`Candidate "${name}" removed.`);
    }
  };

  // Filtered candidate list
  const filteredCandidates = candidates.filter((c) => {
    if (!c) return false;
    const query = (searchQuery || '').toLowerCase();
    const name = (c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const role = (c.role || '').toLowerCase();
    const exp = (c.experience || '').toLowerCase();

    const matchesSearch =
      name.includes(query) ||
      email.includes(query) ||
      role.includes(query) ||
      exp.includes(query);

    const matchesRole =
      selectedRole === 'All' || role.includes(selectedRole.toLowerCase());

    const matchesVerification =
      selectedVerification === 'All' ||
      (selectedVerification === 'Verified' ? Boolean(c.emailVerified) : !c.emailVerified);

    return matchesSearch && matchesRole && matchesVerification;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c120e] text-primary pb-16">
      {/* Top Admin Navigation Header */}
      <header className="bg-white dark:bg-[#131c17] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-primary tracking-tight">
                  Admin Control Panel
                </h1>
                <span className="text-2xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                  Authorized Admin
                </span>
              </div>
              <p className="text-xs text-secondary">
                User Signups, App Telemetry & Salesforce Feed Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition"
            >
              <span>View Learner App</span>
              <ExternalLink size={13} />
            </Link>

            <button
              onClick={() => {
                sessionStorage.removeItem('it_daily_admin_unlocked');
                signOut();
                window.location.href = '/auth';
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/60 transition"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Global Status Notice */}
      {notice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2 shadow-xs animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{notice}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Total Signups */}
          <div className="card p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-2xs sm:text-xs font-bold uppercase tracking-wider">Total Signups</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary">
              {stats.totalUsers}
            </div>
            <p className="text-2xs text-secondary flex items-center gap-1">
              <UserCheck size={11} className="text-emerald-600" />
              <span>{stats.verifiedUsers} verified accounts</span>
            </p>
          </div>

          {/* 2. Total App Opens */}
          <div className="card p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-2xs sm:text-xs font-bold uppercase tracking-wider">Total App Opens</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
                <Eye size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 dark:text-sky-300">
              {stats.totalOpens}
            </div>
            <p className="text-2xs text-secondary flex items-center gap-1">
              <TrendingUp size={11} className="text-sky-600" />
              <span>Live visitor telemetry tracked</span>
            </p>
          </div>

          {/* 3. Active Learners Today */}
          <div className="card p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-2xs sm:text-xs font-bold uppercase tracking-wider">Active Today</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Flame size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {stats.activeToday}
            </div>
            <p className="text-2xs text-secondary flex items-center gap-1">
              <span>Learners active in past 24 hrs</span>
            </p>
          </div>

          {/* 4. Release Topics Available */}
          <div className="card p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-2xs sm:text-xs font-bold uppercase tracking-wider">Curriculum Feed</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
                <BookOpen size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-300">
              {dailyReleaseFeed.length}
            </div>
            <p className="text-2xs text-secondary flex items-center gap-1">
              <span>Winter '27, Summer '26, Spring '26</span>
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Users size={16} />
            <span>Registered Users ({candidates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <BarChart3 size={16} />
            <span>App Opens & Activity Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('releases')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'releases'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Sparkles size={16} />
            <span>Salesforce Release Feeds ({dailyReleaseFeed.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_studio')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'ai_studio'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <BookOpen size={16} />
            <span>AI Curriculum Generator</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: REGISTERED USERS DIRECTORY */}
        {/* ============================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter & Action Toolbar */}
            <div className="card p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate by name, email, or role..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-primary outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  />
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-primary outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="All">All Roles</option>
                    <option value="Developer">Developer</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Architect">Architect</option>
                    <option value="Consultant">Consultant</option>
                  </select>

                  <select
                    value={selectedVerification}
                    onChange={(e) => setSelectedVerification(e.target.value)}
                    className="px-3 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-primary outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Verified">Verified Only</option>
                    <option value="Unverified">Pending OTP</option>
                  </select>

                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
                    title="Export Registered Users to CSV"
                  >
                    <FileSpreadsheet size={15} />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
                  >
                    <Plus size={15} />
                    <span>Add Candidate</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Candidate Table View */}
            <div className="card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-2xs tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Candidate</th>
                      <th className="py-3.5 px-4">Role & Experience</th>
                      <th className="py-3.5 px-4">Verification</th>
                      <th className="py-3.5 px-4">App Opens</th>
                      <th className="py-3.5 px-4">Streak & Progress</th>
                      <th className="py-3.5 px-4">Signed Up</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-400">
                          No candidates found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((c) => (
                        <tr key={c.uid || c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                          {/* Name & Email */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-950 dark:to-teal-900 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                                {(c.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-primary flex items-center gap-1.5">
                                  <span>{c.name || 'Candidate'}</span>
                                  {c.isAdmin && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-secondary text-2xs truncate">{c.email || 'No email'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role & Experience */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-primary">{c.role || 'Developer'}</div>
                            <div className="text-2xs text-muted">{c.experience || 'All Levels'}</div>
                          </td>

                          {/* Verification */}
                          <td className="py-3.5 px-4">
                            {c.emailVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                                <CheckCircle2 size={11} /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                                <Clock size={11} /> Pending OTP
                              </span>
                            )}
                          </td>

                          {/* App Opens */}
                          <td className="py-3.5 px-4 font-bold text-sky-700 dark:text-sky-300">
                            {c.appOpensCount || 1} opens
                          </td>

                          {/* Streak & Lessons */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 text-amber-600 font-semibold text-xs">
                              <Flame size={13} />
                              <span>{c.streakDays || 1} Day Streak</span>
                            </div>
                            <div className="text-2xs text-muted">
                              {c.lessonsCompletedCount || 0} lessons done
                            </div>
                          </td>

                          {/* Signup Date */}
                          <td className="py-3.5 px-4 text-2xs text-secondary">
                            {formatDate(c.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteCandidate(c.uid || (c.id as string), c.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                              title="Delete Candidate Record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: APP OPENS & ACTIVITY STREAM */}
        {/* ============================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 animate-fade-in">
            <div className="card p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-primary">Live App Opens & Telemetry Stream</h3>
                  <p className="text-xs text-secondary">Real-time visitor logs and user activity events</p>
                </div>
                <button
                  onClick={loadData}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RotateCw size={12} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="space-y-2">
                {recentEvents.length === 0 ? (
                  <p className="text-center py-8 text-xs text-muted">No telemetry events recorded yet.</p>
                ) : (
                  recentEvents.slice(0, 20).map((evt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                          {evt?.eventType === 'app_opened' ? <Eye size={13} /> : <CheckCircle2 size={13} />}
                        </div>
                        <div>
                          <div className="font-semibold text-primary capitalize">
                            {(evt?.eventType || 'activity').replace(/_/g, ' ')}
                          </div>
                          <div className="text-2xs text-muted">
                            Screen: <strong>{evt?.screen || 'today'}</strong> • User: {evt?.mockUserId || 'visitor'}
                          </div>
                        </div>
                      </div>
                      <span className="text-2xs text-muted">
                        {formatTime(evt?.timestamp)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SALESFORCE RELEASE FEEDS */}
        {/* ============================================================== */}
        {activeTab === 'releases' && (
          <div className="space-y-4 animate-fade-in">
            <div className="card p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-primary">Active Salesforce Release Topics</h3>
                <p className="text-xs text-secondary">
                  Topics served to candidates across Winter '27, Summer '26, and Spring '26
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dailyReleaseFeed.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200">
                        {item.releaseTag || "Winter '27"}
                      </span>
                      <span className="text-2xs text-muted font-mono">#{idx + 1}</span>
                    </div>
                    <h4 className="font-bold text-sm text-primary">{item.update?.title || 'Topic'}</h4>
                    <p className="text-xs text-secondary line-clamp-2">{item.update?.summary || ''}</p>
                    <div className="pt-1 flex items-center justify-between text-2xs text-muted">
                      <span>Category: {item.topicCategory || 'Salesforce'}</span>
                      {item.update?.sourceUrl && (
                        <a
                          href={item.update.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Official Docs</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: AI STUDIO & PUBLISHING */}
        {/* ============================================================== */}
        {activeTab === 'ai_studio' && (
          <div className="animate-fade-in">
            <Suspense
              fallback={
                <div className="p-8 text-center text-xs text-muted">
                  Loading AI Content Generator...
                </div>
              }
            >
              <GenerationScreen />
            </Suspense>
          </div>
        )}
      </main>

      {/* Modal: Add Candidate */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-md w-full p-6 space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-primary">Register New Candidate</h3>
            <form onSubmit={handleAddCandidate} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-2xs font-bold uppercase text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase text-muted mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. ramesh@company.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase text-muted mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Developer">Developer</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Technical Architect">Technical Architect</option>
                  <option value="Consultant / BA">Consultant / BA</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase text-muted mb-1">Experience</label>
                <select
                  value={newUserExp}
                  onChange={(e) => setNewUserExp(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Fresher (0–1 yr)">Fresher (0–1 yr)</option>
                  <option value="Junior (1–3 yrs)">Junior (1–3 yrs)</option>
                  <option value="Mid (3–5 yrs)">Mid (3–5 yrs)</option>
                  <option value="Senior (5–8 yrs)">Senior (5–8 yrs)</option>
                  <option value="Architect (8+ yrs)">Architect (8+ yrs)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary hover:text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
