import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Landmark, Bell, LogOut, LayoutDashboard, FileText, Calendar, 
  LifeBuoy, UserCog, UserCheck, ShieldAlert, BadgeAlert, TrendingUp, Coins,
  Folder, BarChart3, User, CreditCard
} from 'lucide-react';
import { PATHS, ROLES } from '../utils/constants';
import { ticketStore } from '../utils/ticketStore';
import Button from '../components/common/Button';
import HelpCenterModal from '../components/modals/HelpCenterModal';

/**
 * ============================================================
 * SECURE DASHBOARD WORKSPACE LAYOUT
 * Features a clean, non-collapsible STICKY sidebar (no scroll needed)
 * Standalone HelpCenterModal support overlay with unread notifications.
 * ============================================================
 */
export default function DashboardLayout() {
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Read session data
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const userRole = session.role || ROLES.BORROWER;
  const userName = session.name || 'User';

  useEffect(() => {
    if (userRole === ROLES.BORROWER) {
      updateUnread();
      const interval = setInterval(updateUnread, 3000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  const updateUnread = () => {
    const count = ticketStore.getUnreadCount();
    setUnreadCount(count);
  };

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

  // Define sidebar menu items configuration based on user roles (Statements removed)
  const menuConfigs = {
    [ROLES.BORROWER]: [
      { label: 'Dashboard', path: PATHS.BORROWER_DASHBOARD, icon: LayoutDashboard },
      { label: 'My Loans', path: PATHS.BORROWER_LOANS, icon: Landmark },
      { label: 'Applications', path: PATHS.BORROWER_APPLICATIONS, icon: FileText },
      { label: 'EMI & Payments', path: PATHS.BORROWER_EMI_CALENDAR, icon: CreditCard },
      { label: 'Help Center', path: PATHS.BORROWER_SUPPORT, icon: LifeBuoy },
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

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 antialiased">
      
      {/* 1. STICKY NON-COLLAPSIBLE SIDEBAR PANEL */}
      <aside className="sticky top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0 z-30 overflow-y-auto">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-4 border-b border-slate-800 gap-3">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white flex-shrink-0">
              <Landmark className="h-5 w-5" />
            </div>
            <span className="text-md font-bold tracking-tight text-white">
              LoanVault
            </span>
          </div>

          {/* Role badge under brand */}
          <div className="px-4 pt-4 pb-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          {/* Sidebar Nav Items */}
          <nav className="py-2 px-3 space-y-1">
            {activeMenuLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isHelpCenter = item.path === PATHS.BORROWER_SUPPORT;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isHelpCenter && unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-bold text-[10px] shadow-sm flex-shrink-0 animate-pulse">
                      {unreadCount} New
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Bar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-white">
              Borrower Workspace Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile Info Pill */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {userName.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight">{userName}</p>
                <p className="text-[10px] text-slate-400 capitalize">{userRole.toLowerCase()}</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogOut}
                className="text-slate-400 hover:text-red-400 p-2 ml-2"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openHelpCenter: () => setIsHelpCenterOpen(true) }} />
        </main>
      </div>

      {/* Help Center Standalone Modal */}
      <HelpCenterModal isOpen={isHelpCenterOpen} onClose={() => setIsHelpCenterOpen(false)} />

    </div>
  );
}
