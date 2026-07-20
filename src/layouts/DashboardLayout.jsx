import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Landmark, Bell, LogOut, ChevronLeft, LayoutDashboard, FileText, Calendar, 
  LifeBuoy, UserCog, UserCheck, ShieldAlert, BadgeAlert, TrendingUp, Coins,
  Folder, BarChart3, User, CreditCard
} from 'lucide-react';
import { PATHS, ROLES } from '../utils/constants';
import Button from '../components/common/Button';

/**
 * ============================================================
 * SECURE DASHBOARD WORKSPACE LAYOUT
 * Renders role-specific sidebars, header navigation bars,
 * notifications bell toggles, and handles log out session clearances.
 * ============================================================
 */
export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Read session data
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const userRole = session.role || ROLES.BORROWER;
  const userName = session.name || 'User';

  const handleLogOut = () => {
    localStorage.removeItem('lms_session');
    navigate(PATHS.LOGIN);
  };

  // Role badge config
  const roleBadgeConfig = {
    [ROLES.BORROWER]: { label: 'Borrower', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    [ROLES.OFFICER]: { label: 'Loan Officer', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    [ROLES.MANAGER]: { label: 'Loan Manager', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
    [ROLES.ADMIN]: { label: 'System Admin', color: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  };
  const badge = roleBadgeConfig[userRole] || roleBadgeConfig[ROLES.BORROWER];

  // Define sidebar menu items configuration based on user roles
  const menuConfigs = {
    [ROLES.BORROWER]: [
      { label: 'Dashboard', path: PATHS.BORROWER_DASHBOARD, icon: LayoutDashboard },
      { label: 'My Loans', path: PATHS.BORROWER_LOANS, icon: Landmark },
      { label: 'Applications', path: PATHS.BORROWER_APPLICATIONS, icon: FileText },
      { label: 'EMI & Payments', path: PATHS.BORROWER_EMI_CALENDAR, icon: CreditCard },
      { label: 'Documents', path: PATHS.BORROWER_DOCUMENTS, icon: Folder },
      { label: 'Statements', path: PATHS.BORROWER_STATEMENTS, icon: BarChart3 },
      { label: 'Profile & Settings', path: PATHS.BORROWER_PROFILE, icon: User },
    ],
    [ROLES.OFFICER]: [
      { label: 'Overview', path: PATHS.OFFICER_DASHBOARD, icon: LayoutDashboard },
      { label: 'Application Queue', path: PATHS.OFFICER_QUEUE, icon: FileText },
      { label: 'Performance Tracker', path: PATHS.OFFICER_PERFORMANCE, icon: UserCheck },
    ],
    [ROLES.MANAGER]: [
      { label: 'Dashboard', path: PATHS.MANAGER_DASHBOARD, icon: LayoutDashboard },
      { label: 'Approval Queue', path: PATHS.MANAGER_APPROVALS, icon: BadgeAlert },
      { label: 'Portfolio Reports', path: PATHS.MANAGER_PORTFOLIO, icon: TrendingUp },
      { label: 'Team Management', path: PATHS.MANAGER_TEAM, icon: UserCog },
      { label: 'Disbursement Hub', path: PATHS.MANAGER_DISBURSEMENTS, icon: Coins },
      { label: 'NPA Collector', path: PATHS.MANAGER_NPA, icon: ShieldAlert },
    ],
    [ROLES.ADMIN]: [
      { label: 'System Overview', path: PATHS.ADMIN_DASHBOARD, icon: LayoutDashboard },
      { label: 'Manage Users', path: PATHS.ADMIN_USERS, icon: UserCog },
      { label: 'Audit Trail Logs', path: PATHS.ADMIN_AUDIT_TRAIL, icon: ShieldAlert },
      { label: 'System Config', path: PATHS.ADMIN_SETTINGS, icon: UserCheck },
    ]
  };

  const activeMenuLinks = menuConfigs[userRole] || [];

  // Find active page label for header breadcrumb
  const activePageLabel = activeMenuLinks.find(item => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 antialiased">
      {/* 1. SIDEBAR PANEL */}
      <aside 
        className={`bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 relative z-30 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800 gap-3">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white flex-shrink-0">
            <Landmark className="h-5 w-5" />
          </div>
          {isSidebarOpen && (
            <span className="text-md font-bold tracking-tight text-white animate-in fade-in duration-200">
              LoanVault
            </span>
          )}
        </div>

        {/* Role badge under brand — only when sidebar is open */}
        {isSidebarOpen && (
          <div className="px-4 pt-3 pb-1 animate-in fade-in duration-200">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        )}

        {/* Sidebar Nav Items */}
        <nav className="flex-grow py-4 px-3 space-y-1">
          {activeMenuLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!isSidebarOpen ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'}`} />
                {isSidebarOpen && (
                  <span className="truncate animate-in fade-in duration-200">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Need Help Widget Box */}
        {isSidebarOpen && userRole === ROLES.BORROWER && (
          <div className="mx-3 mb-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <LifeBuoy className="h-5 w-5" />
              <span className="text-xs font-bold text-white">Need Help?</span>
            </div>
            <p className="text-[11px] text-slate-400">We're here to assist you with your loan.</p>
            <button
              onClick={() => navigate(PATHS.BORROWER_PROFILE)}
              className="w-full mt-1 py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-bold transition-all text-center"
            >
              Visit Help Center →
            </button>
          </div>
        )}

        {/* Sidebar Collapse Toggle Button */}
        <div className="p-4 border-t border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
            {isSidebarOpen && <span>Collapse</span>}
          </Button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE PANEL */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {/* Breadcrumb with page title */}
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider leading-none mb-0.5">
                {badge.label}
              </span>
              <span className="text-sm font-bold text-white leading-none">
                {activePageLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User name pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
              <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-300">{userName}</span>
            </div>

            {/* Bell notification triggers */}
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 relative transition-all focus:outline-none">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-500 rounded-full ring-2 ring-slate-900" />
            </button>

            {/* Logout Trigger button */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={LogOut}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 focus:ring-red-500/25"
              onClick={handleLogOut}
            >
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Dynamic Inner Body contents viewport */}
        <main className="flex-grow p-6 overflow-y-auto bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
