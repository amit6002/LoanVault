import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Activity, HardDrive, Cpu, Terminal, ArrowRight, FileText, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS, STATUS_CONFIG } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * ADMIN SYSTEM DASHBOARD COMPONENT
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

      // Compute stats from real data
      setAppStats({
        total: apps.length,
        submitted: apps.filter(a => a.status === 'SUBMITTED' || a.status === 'DOC_VERIFICATION' || a.status === 'CREDIT_CHECK').length,
        recommended: apps.filter(a => a.status === 'RECOMMENDED_APPROVE' || a.status === 'RECOMMENDED_REJECT').length,
        approved: apps.filter(a => a.status === 'APPROVED' || a.status === 'DISBURSEMENT_PENDING' || a.status === 'DISBURSED').length,
        rejected: apps.filter(a => a.status === 'REJECTED').length,
      });

      // Show most recent 4 applications in the log
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Control Center
          </h1>
          <p className="text-sm text-slate-400">
            System Console: <span className="text-emerald-500 font-semibold">{adminName}</span>
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

      {/* 2. Application Stats Grid — Real data from backend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Applications */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-blue-500/20"><FileText className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Applications</p>
          <p className="text-2xl font-black text-white">
            {isLoadingApps ? '...' : appStats.total}
          </p>
        </div>

        {/* Pending Review */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-amber-500/20"><Clock className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-black text-amber-400">
            {isLoadingApps ? '...' : appStats.submitted}
          </p>
        </div>

        {/* Approved / Disbursed */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-emerald-500/20"><CheckCircle2 className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved / Disbursed</p>
          <p className="text-2xl font-black text-emerald-400">
            {isLoadingApps ? '...' : appStats.approved}
          </p>
        </div>

        {/* Rejected */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-red-500/20"><XCircle className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected</p>
          <p className="text-2xl font-black text-red-400">
            {isLoadingApps ? '...' : appStats.rejected}
          </p>
        </div>

      </div>

      {/* 3. Main logs workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Real-time system console logs (8 columns) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-blue-500" />
            Recent Application Activity
          </h2>

          <div className="space-y-4">
            {systemLogs.map((log, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex justify-between items-center text-xs font-mono">
                <div className="flex gap-4 items-center">
                  <span className="text-slate-500">[{log.time}]</span>
                  <span className="text-slate-300 font-semibold">{log.event}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : log.status === 'WARNING' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations shortcut (4 columns) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-2">
            <button onClick={() => navigate(PATHS.ADMIN_USERS)} className="w-full text-left p-3 rounded-lg bg-slate-950/60 border border-slate-850 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all">
              Manage User Accounts
            </button>
            <button onClick={() => navigate(PATHS.ADMIN_AUDIT_TRAIL)} className="w-full text-left p-3 rounded-lg bg-slate-950/60 border border-slate-850 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all">
              Search Immutable Audit Trail Logs
            </button>
            <button onClick={fetchApplicationStats} className="w-full text-left p-3 rounded-lg bg-slate-950/60 border border-slate-850 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all">
              Refresh Application Statistics
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
