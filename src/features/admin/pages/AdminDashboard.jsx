import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Activity, HardDrive, Cpu, Terminal, ArrowRight, FileText, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS, STATUS_CONFIG } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * ADMIN SYSTEM DASHBOARD COMPONENT (LIGHT THEME)
 * Renders server nodes health metric gauges, total active account counts,
 * real application statistics, and background operations logs.
 * ============================================================
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const adminName = session.name || 'System Admin';

  const [appStats, setAppStats] = useState({
    total: 0,
    submitted: 0,
    recommended: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentApps, setRecentApps] = useState([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);

  useEffect(() => {
    fetchApplicationStats();
  }, []);

  const fetchApplicationStats = async () => {
    setIsLoadingApps(true);
    try {
      const data = await api.get('/api/applications/all');
      const apps = Array.isArray(data) ? data : [];

      setAppStats({
        total: apps.length,
        submitted: apps.filter(a => a.status === 'SUBMITTED' || a.status === 'DOC_VERIFICATION' || a.status === 'CREDIT_CHECK').length,
        recommended: apps.filter(a => a.status === 'RECOMMENDED_APPROVE' || a.status === 'RECOMMENDED_REJECT').length,
        approved: apps.filter(a => a.status === 'APPROVED' || a.status === 'DISBURSEMENT_PENDING' || a.status === 'DISBURSED').length,
        rejected: apps.filter(a => a.status === 'REJECTED').length,
      });

      setRecentApps(apps.slice(0, 4).map(a => ({
        time: a.lastUpdatedAt || a.appliedAt
          ? new Date(a.lastUpdatedAt || a.appliedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
          : 'N/A',
        event: `${a.fullName || 'Borrower'} — ${a.loanType || 'Loan'} application (${a.referenceId})`,
        status: a.status === 'REJECTED' ? 'WARNING'
          : (a.status === 'APPROVED' || a.status === 'DISBURSEMENT_PENDING' || a.status === 'DISBURSED') ? 'SUCCESS'
          : 'INFO',
      })));
    } catch (err) {
      console.warn('Failed to fetch application stats:', err);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const systemLogs = recentApps.length > 0 ? recentApps : [
    { time: '--:--:--', event: 'No recent application activity', status: 'INFO' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xs">
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Control Center
          </h1>
          <p className="text-sm text-slate-500">
            System Console: <span className="text-indigo-600 font-bold">{adminName}</span>
          </p>
        </div>

        <div className="relative z-10">
          <Button 
            variant="primary" 
            size="md" 
            rightIcon={ArrowRight}
            onClick={() => navigate(PATHS.ADMIN_USERS)}
          >
            Manage User Accounts
          </Button>
        </div>
      </div>

      {/* 2. Application Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applications</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {isLoadingApps ? '...' : appStats.total}
          </p>
        </div>

        {/* Pending Review */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700">
            {isLoadingApps ? '...' : appStats.submitted}
          </p>
        </div>

        {/* Approved / Disbursed */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved / Disbursed</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {isLoadingApps ? '...' : appStats.approved}
          </p>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">
            {isLoadingApps ? '...' : appStats.rejected}
          </p>
        </div>
      </div>

      {/* 3. Main logs workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Real-time system console logs (8 columns) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-indigo-600" />
            Recent Application Activity
          </h2>

          <div className="space-y-3">
            {systemLogs.map((log, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-xs font-mono">
                <div className="flex gap-4 items-center">
                  <span className="text-slate-400">[{log.time}]</span>
                  <span className="text-slate-800 font-semibold">{log.event}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                  log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : log.status === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations shortcut (4 columns) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-2.5">
            <button onClick={() => navigate(PATHS.ADMIN_USERS)} className="w-full text-left p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-500/50 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer">
              Manage User Accounts
            </button>
            <button onClick={() => navigate(PATHS.ADMIN_AUDIT_TRAIL)} className="w-full text-left p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-500/50 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer">
              Search Immutable Audit Trail Logs
            </button>
            <button onClick={fetchApplicationStats} className="w-full text-left p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-500/50 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer">
              Refresh Application Statistics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
