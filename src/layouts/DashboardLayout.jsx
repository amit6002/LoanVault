import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Landmark, LogOut, LayoutDashboard, FileText,
  UserCog, UserCheck, ShieldAlert, BadgeAlert, TrendingUp, Coins,
  User, CreditCard, Bell, Settings, ChevronDown, Menu, X,
} from 'lucide-react';
import { PATHS, ROLES } from '../utils/constants';
import Button from '../components/common/Button';

/**
 * ============================================================
 * ENHANCED DASHBOARD WORKSPACE LAYOUT
 * Premium glassmorphism design with smooth transitions,
 * collapsible mobile sidebar, and sophisticated navigation.
 * ============================================================
 */
export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Read session data
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const userRole = session.role || ROLES.BORROWER;
  const userName = session.name || 'User';

  const handleLogOut = () => {
    localStorage.removeItem('lms_session');
    navigate(PATHS.LOGIN);
  };

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Role badge config with icons
  const roleBadgeConfig = {
    [ROLES.BORROWER]: {
      label: 'Borrower',
      color: 'bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200',
      icon: '👤',
    },
    [ROLES.OFFICER]: {
      label: 'Loan Officer',
      color: 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 border border-amber-200',
      icon: '📋',
    },
    [ROLES.MANAGER]: {
      label: 'Loan Manager',
      color: 'bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 border border-purple-200',
      icon: '👔',
    },
    [ROLES.ADMIN]: {
      label: 'System Admin',
      color: 'bg-gradient-to-br from-rose-50 to-red-50 text-rose-700 border border-rose-200',
      icon: '⚙️',
    },
  };
  const badge = roleBadgeConfig[userRole] || roleBadgeConfig[ROLES.BORROWER];

  // Sidebar nav configurations per role
  const menuConfigs = {
    [ROLES.BORROWER]: [
      { label: 'Dashboard',        path: PATHS.BORROWER_DASHBOARD,    icon: LayoutDashboard },
      { label: 'My Loans',         path: PATHS.BORROWER_LOANS,         icon: Landmark },
      { label: 'Applications',     path: PATHS.BORROWER_APPLICATIONS,  icon: FileText },
      { label: 'EMI & Payments',   path: PATHS.BORROWER_EMI_CALENDAR,  icon: CreditCard },
      { label: 'Documents',        path: PATHS.BORROWER_DOCUMENTS,     icon: FileText },
      { label: 'Profile & Settings', path: PATHS.BORROWER_PROFILE,    icon: User },
    ],
    [ROLES.OFFICER]: [
      { label: 'Dashboard',        path: PATHS.OFFICER_DASHBOARD,      icon: LayoutDashboard },
      { label: 'Application Queue', path: PATHS.OFFICER_QUEUE,         icon: FileText },
      { label: 'Performance',      path: PATHS.OFFICER_PERFORMANCE,    icon: TrendingUp },
    ],
    [ROLES.MANAGER]: [
      { label: 'Dashboard',        path: PATHS.MANAGER_DASHBOARD,      icon: LayoutDashboard },
      { label: 'Approval Queue',   path: PATHS.MANAGER_APPROVALS,      icon: BadgeAlert },
      { label: 'Portfolio Reports', path: PATHS.MANAGER_PORTFOLIO,     icon: TrendingUp },
      { label: 'Team Management',  path: PATHS.MANAGER_TEAM,           icon: UserCog },
      { label: 'Disbursement Hub', path: PATHS.MANAGER_DISBURSEMENTS,  icon: Coins },
      { label: 'NPA Collector',    path: PATHS.MANAGER_NPA,            icon: ShieldAlert },
    ],
    [ROLES.ADMIN]: [
      { label: 'System Overview',  path: PATHS.ADMIN_DASHBOARD,        icon: LayoutDashboard },
      { label: 'Manage Users',     path: PATHS.ADMIN_USERS,            icon: UserCog },
      { label: 'Audit Trail Logs', path: PATHS.ADMIN_AUDIT_TRAIL,      icon: ShieldAlert },
      { label: 'System Config',    path: PATHS.ADMIN_SETTINGS,         icon: UserCheck },
    ],
  };

  const activeMenuLinks = menuConfigs[userRole] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/20 flex text-slate-900 antialiased">

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR PANEL */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 flex flex-col z-40 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-card ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-20 flex items-center px-6 border-b border-slate-200/60 gap-3 flex-shrink-0">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl text-white flex-shrink-0 shadow-lg shadow-indigo-600/30">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                LoanVault
              </span>
              <p className="text-xs text-slate-500 font-medium">Enterprise Platform</p>
            </div>
          </div>

          {/* Role Badge */}
          <div className="px-6 pt-5 pb-2 flex-shrink-0">
            <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold ${badge.color}`}>
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="px-3 py-3 space-y-1 flex-1 overflow-y-auto hide-scrollbar">
            {activeMenuLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-smooth-fast group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-white/80 flex-shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200/60 p-4 space-y-3 flex-shrink-0">
          <div className="px-2 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{userName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogOut}
            className="w-full justify-center text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER BAR — Glassmorphism */}
        <header className="sticky top-0 h-20 glass-effect border-b border-slate-200/50 px-6 flex items-center justify-between z-20 shadow-card">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-smooth-fast border border-transparent hover:border-slate-200"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="hidden md:flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-glow" />
              <span className="text-sm font-bold text-slate-800 tracking-tight">
                {userRole.charAt(0) + userRole.slice(1).toLowerCase().replace('_', ' ')} Workspace
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications Bell */}
            <button className="relative p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-smooth-fast border border-transparent hover:border-slate-200">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse-glow" />
            </button>

            {/* Settings */}
            <button className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-smooth-fast border border-transparent hover:border-slate-200">
              <Settings className="h-5 w-5" />
            </button>

            {/* User Dropdown */}
            <div className="relative ml-1" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-smooth-fast border border-slate-200/60 hover:border-slate-300"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-600/20">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-slate-700 max-w-24 truncate">
                  {userName.split(' ')[0]}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card-lg border border-slate-200/60 overflow-hidden z-50 animate-slide-down">
                  <div className="px-4 py-3.5 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/30">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{userName}</p>
                    <p className="text-xs text-slate-500 capitalize">{userRole.toLowerCase()}</p>
                  </div>
                  <button
                    onClick={handleLogOut}
                    className="w-full text-left px-4 py-3.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-smooth-fast flex items-center gap-2.5"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
