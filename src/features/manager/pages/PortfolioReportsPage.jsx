import { Landmark, FileText, CheckCircle2, AlertTriangle, ShieldCheck, PieChart, BarChart2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN MANAGER PORTFOLIO & RISK REPORT PAGE (LIGHT THEME)
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
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Portfolio & Risk Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Review active default profiles, SMA-class alerts, and gross credit risk indexes.</p>
      </div>

      {/* Overview Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Risk Exposure</span>
            <span className="text-xl font-black text-slate-900 mt-1">{formatCurrency(1590000, false)}</span>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">SMA Account count</span>
            <span className="text-xl font-black text-slate-900 mt-1">2 Accounts Active</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">SLA turnaround Rate</span>
            <span className="text-xl font-black text-emerald-600">97.8% / Excellent</span>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Default details table (8 columns) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
            Overdue Default SMA Accounts list
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl text-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-400 uppercase text-[10px]">Loan ID</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-400 uppercase text-[10px]">Client / Co-Applicant</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-400 uppercase text-[10px]">Outstanding</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-400 uppercase text-[10px]">NPA Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {npaAccounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600">{acc.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{acc.clientName}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">{formatCurrency(acc.outstanding, false)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
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
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="h-4.5 w-4.5 text-indigo-600" />
            Download Summary
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
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
