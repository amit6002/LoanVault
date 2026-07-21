import { useState, useEffect } from 'react';
import { Landmark, BadgeAlert, FileText, CheckCircle2, TrendingUp, AlertTriangle, UserCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN MANAGER DASHBOARD COMPONENT (LIGHT THEME)
 * Renders AUM metrics, team load distributions, and approval alerts.
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
      const data = await api.get('/api/manager/stats').catch(() => null);
      if (data) {
        setStats({
          portfolioAum: data.portfolioAum || 1245000000,
          pendingSanctionCount: data.pendingSanctionCount || 14,
          disbursedThisMonth: data.disbursedThisMonth || 85000000,
          grossNpaRatio: data.grossNpaRatio || 0.85,
        });
      } else {
        setStats({
          portfolioAum: 1245000000,
          pendingSanctionCount: 14,
          disbursedThisMonth: 85000000,
          grossNpaRatio: 0.85,
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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xs">
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manager Control Desk
          </h1>
          <p className="text-sm text-slate-500">
            Active Administrator: <span className="text-indigo-600 font-bold">{managerName}</span>
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
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Portfolio Assets (AUM)</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : formatCurrency(stats.portfolioAum, false)}
          </p>
        </div>

        {/* Pending Manager Sanction */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Sanctions</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <BadgeAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600">
            {isLoading ? '...' : `${stats.pendingSanctionCount} Cases`}
          </p>
        </div>

        {/* Disbursed Amount */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disbursed Volume</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {isLoading ? '...' : formatCurrency(stats.disbursedThisMonth, false)}
          </p>
        </div>

        {/* NPA Ratio */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross NPA Ratio</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {stats.grossNpaRatio}% <span className="text-xs font-semibold text-slate-400 ml-1">/ Standard</span>
          </p>
        </div>
      </div>

      {/* 3. Priority operations table lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Branch metrics overview (8 columns) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
            Branch Operations Performance
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl text-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-400 uppercase text-[10px]">Branch Name</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-400 uppercase text-[10px]">Sanctioned Cases</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-400 uppercase text-[10px]">AUM Valuation</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-400 uppercase text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">Mumbai Main Office</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">482</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">{formatCurrency(684000000, false)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      OPTIMAL
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">Delhi Connaught Place</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">312</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">{formatCurrency(412000000, false)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      OPTIMAL
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">Bangalore Whitefield</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">218</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">{formatCurrency(149000000, false)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      REVIEW
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Shortcuts (4 columns) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigate(PATHS.MANAGER_APPROVALS)}
              className="w-full text-left p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-500/50 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer"
            >
              Verify Underwriter Sanction Proposals
            </button>
            <button
              onClick={() => navigate(PATHS.MANAGER_DISBURSEMENTS)}
              className="w-full text-left p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-500/50 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer"
            >
              Open Disbursement Hub
            </button>
            <button
              onClick={() => navigate(PATHS.MANAGER_PORTFOLIO)}
              className="w-full text-left p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-500/50 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer"
            >
              Generate Portfolio Risk Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
