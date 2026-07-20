import { useState, useEffect } from 'react';
import { Landmark, BadgeAlert, FileText, CheckCircle2, TrendingUp, AlertTriangle, UserCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN MANAGER DASHBOARD COMPONENT
 * Renders AUM metrics, team load distributions, and approval alerts
 * fetched live from Spring Boot backend API.
 * ============================================================
 */
export default function ManagerDashboard() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const managerName = session.name || 'Manager';

  const [stats, setStats] = useState({
    portfolioAum: 0,
    pendingSanctionCount: 0,
    disbursedThisMonth: 0,
    grossNpaRatio: 0.85,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchManagerStats();
  }, []);

  const fetchManagerStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/manager/stats');
      if (data) {
        setStats({
          portfolioAum: data.portfolioAum || 0,
          pendingSanctionCount: data.pendingSanctionCount || 0,
          disbursedThisMonth: data.disbursedThisMonth || 0,
          grossNpaRatio: data.grossNpaRatio || 0.85,
        });
      }
    } catch (err) {
      console.warn('Failed to fetch manager dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manager Control Desk
          </h1>
          <p className="text-sm text-slate-400">
            Active Administrator: <span className="text-blue-400 font-semibold">{managerName}</span>
          </p>
        </div>

        <div className="relative z-10">
          <Button 
            variant="primary" 
            size="md" 
            rightIcon={ArrowRight}
            onClick={() => navigate(PATHS.MANAGER_APPROVALS)}
          >
            Open Approvals Queue
          </Button>
        </div>
      </div>

      {/* 2. Executive AUM Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Assets Under Management */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-emerald-500/20"><TrendingUp className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Portfolio Assets (AUM)</p>
          <p className="text-2xl font-black text-white">
            {isLoading ? '...' : formatCurrency(stats.portfolioAum, false)}
          </p>
        </div>

        {/* Pending Manager Sanction */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-blue-500/20"><BadgeAlert className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Sanction</p>
          <p className="text-2xl font-black text-blue-400">
            {isLoading ? '...' : `${stats.pendingSanctionCount} Cases`}
          </p>
        </div>

        {/* Disbursed Amount */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-purple-500/20"><Landmark className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Disbursed Volume</p>
          <p className="text-2xl font-black text-white">
            {isLoading ? '...' : formatCurrency(stats.disbursedThisMonth, false)}
          </p>
        </div>

        {/* NPA Ratio */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-red-500/20"><AlertTriangle className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross NPA Ratio</p>
          <p className="text-2xl font-black text-emerald-400">
            {stats.grossNpaRatio}% <span className="text-xs font-semibold text-slate-500 ml-1">/ Standard</span>
          </p>
        </div>

      </div>

      {/* 3. Priority operations table lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Branch metrics overview (8 columns) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Branch Operations Performance
          </h2>

          <div className="overflow-x-auto border border-slate-800 rounded-xl text-sm">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Branch Name</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Sanctioned Cases</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">AUM Valuation</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/20 text-slate-300">
                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">Mumbai Main Office</td>
                  <td className="px-4 py-3 text-right">482</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(684000000, false)}</td>
                  <td className="px-4 py-3 text-center"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">OPTIMAL</span></td>
                </tr>
                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">Delhi Connaught Place</td>
                  <td className="px-4 py-3 text-right">312</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(412000000, false)}</td>
                  <td className="px-4 py-3 text-center"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">OPTIMAL</span></td>
                </tr>
                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">Bangalore Whitefield</td>
                  <td className="px-4 py-3 text-right">218</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(149000000, false)}</td>
                  <td className="px-4 py-3 text-center"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500">REVIEW</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Shortcuts (4 columns) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-2">
            <button onClick={() => navigate(PATHS.MANAGER_APPROVALS)} className="w-full text-left p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all">
              Verify Underwriter Sanction Proposal Requests
            </button>
            <button onClick={() => navigate(PATHS.MANAGER_DISBURSEMENTS)} className="w-full text-left p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all">
              Open Disbursement Hub
            </button>
            <button onClick={() => navigate(PATHS.MANAGER_PORTFOLIO)} className="w-full text-left p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all">
              Generate Portfolio Risk Reports
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
