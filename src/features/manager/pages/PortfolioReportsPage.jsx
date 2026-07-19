import { Landmark, FileText, CheckCircle2, AlertTriangle, ShieldCheck, PieChart, BarChart2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN MANAGER PORTFOLIO & RISK REPORT PAGE
 * Renders Gross NPA distribution parameters, asset quality audits,
 * and repayment ratios.
 * ============================================================
 */
export default function PortfolioReportsPage() {
  const npaAccounts = [
    { id: 'LN-NPA-401', clientName: 'Dev Enterprises', category: 'SMA-2 (61-90 Days Overdue)', outstanding: 1250000, lastPayDate: '12 May 2026' },
    { id: 'LN-NPA-902', clientName: 'Rajesh Sharma', category: 'SMA-1 (31-60 Days Overdue)', outstanding: 340000, lastPayDate: '02 Jun 2026' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Heading */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Portfolio & Risk Reports</h1>
        <p className="text-sm text-slate-400 mt-1">Review active default profiles, SMA-class alerts, and gross credit risk indexes.</p>
      </div>

      {/* Overview Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Risk Exposure</span>
            <span className="text-xl font-bold text-white mt-1">{formatCurrency(1590000, false)}</span>
          </div>
          <AlertTriangle className="h-8 w-8 text-red-500/20" />
        </div>
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">SMA Account count</span>
            <span className="text-xl font-bold text-white mt-1">2 Accounts Active</span>
          </div>
          <CheckCircle2 className="h-8 w-8 text-emerald-500/20" />
        </div>
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">SLA turnaround Rate</span>
            <span className="text-xl font-bold text-emerald-400">97.8% / Excellent</span>
          </div>
          <ShieldCheck className="h-8 w-8 text-blue-500/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Default details table (8 columns) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Overdue Default SMA Accounts list
          </h2>

          <div className="overflow-x-auto border border-slate-800 rounded-xl text-sm">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Loan ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-400">Client / Co-Applicant</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-400">Outstanding</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-400">NPA Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-900/20 text-slate-300">
                {npaAccounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{acc.id}</td>
                    <td className="px-4 py-3 font-semibold text-white">{acc.clientName}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(acc.outstanding, false)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                        {acc.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action reports panels (4 columns) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="h-4.5 w-4.5 text-blue-500" />
            Download Summary
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generate and export the monthly NPA classifications file required for RBI audits and credit risk inspections.
          </p>
          <div className="pt-2">
            <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2">
              <PieChart className="h-4 w-4" />
              Download Regulatory Report
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
}
