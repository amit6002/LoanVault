import { LayoutDashboard, Users, Activity, HardDrive, Cpu, Terminal, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../utils/constants';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * ADMIN SYSTEM DASHBOARD COMPONENT
 * Renders server nodes health metric gauges, total active account counts,
 * and background operations logs.
 * ============================================================
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const adminName = session.name || 'System Admin';

  const systemLogs = [
    { time: '16:42:10', event: 'JWT Token generated for manager@loanvault.com', status: 'SUCCESS' },
    { time: '16:38:05', event: 'CIBIL Pull API call initiated for LN-2026-04921', status: 'INFO' },
    { time: '16:15:22', event: 'Document upload verification for APP-00812', status: 'WARNING' },
    { time: '15:30:11', event: 'New Borrower account registration created', status: 'SUCCESS' }
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

      {/* 2. System Health Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Users */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-blue-500/20"><Users className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active Users</p>
          <p className="text-2xl font-black text-white">1,424</p>
        </div>

        {/* Server Status */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-emerald-500/20"><Activity className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Server Node Health</p>
          <p className="text-2xl font-black text-emerald-400">99.98% <span className="text-xs font-semibold text-slate-500 ml-1">/ Excellent</span></p>
        </div>

        {/* CPU utilization */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-purple-500/20"><Cpu className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CPU Load Ratio</p>
          <p className="text-2xl font-black text-white">18.4%</p>
        </div>

        {/* Space limits */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-amber-500/20"><HardDrive className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Storage Capacity</p>
          <p className="text-2xl font-black text-white">34.2%</p>
        </div>

      </div>

      {/* 3. Main logs workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Real-time system console logs (8 columns) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-blue-500" />
            Live System Event Console
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
            <button onClick={() => navigate(PATHS.ADMIN_AUDIT_TRAIL)} className="w-full text-left p-3 rounded-lg bg-slate-950/60 border border-slate-850 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all">
              Search Immutable Audit Trail Logs
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-slate-950/60 border border-slate-850 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all">
              Backup Application Database Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
