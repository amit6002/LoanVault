import { Award, CheckCircle2, AlertTriangle, Clock, RefreshCw, BarChart2, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * OFFICER PERFORMANCE TRACKER COMPONENT (LIGHT THEME)
 * Renders statistical tracking metrics, monthly evaluation
 * checkpoints, and compliance levels.
 * ============================================================
 */
export default function PerformanceTrackerPage() {
  const stats = [
    { label: 'Total Cases Handled', value: '142', description: 'Past 30 Days' },
    { label: 'Verification SLA', value: '98.2%', description: 'Target: 95.0%', trend: 'positive' },
    { label: 'Avg processing Time', value: '2.4 Days', description: 'Target: 3.0 Days', trend: 'positive' },
    { label: 'KYC Error rate', value: '0.8%', description: 'Limit: < 2.0%', trend: 'positive' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Heading */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Performance Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Review processed audit workload stats, verification quality indexes, and compliance scores.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 relative shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stat.value}</span>
              {stat.trend && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">✓ Target Met</span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Detailed Analysis section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Quality checkpoint grid (8 columns) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <Award className="h-5 w-5 text-indigo-600" />
            Verification Quality Benchmarks
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex justify-between items-center text-xs">
              <div className="space-y-1">
                <h5 className="font-bold text-slate-900 text-sm">Income Verification Accuracy</h5>
                <p className="text-slate-500 font-medium">Cross-auditing salary slips with ITR declarations.</p>
              </div>
              <span className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                100% Quality Pass
              </span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex justify-between items-center text-xs">
              <div className="space-y-1">
                <h5 className="font-bold text-slate-900 text-sm">KYC Address Match Index</h5>
                <p className="text-slate-500 font-medium">Matching utility bills against Aadhaar location databases.</p>
              </div>
              <span className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                99.2% Quality Pass
              </span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex justify-between items-center text-xs">
              <div className="space-y-1">
                <h5 className="font-bold text-slate-900 text-sm">Compliance Audit Log Filing</h5>
                <p className="text-slate-500 font-medium">Submitting checklist verification summaries to Manager queues.</p>
              </div>
              <span className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                100% Quality Pass
              </span>
            </div>
          </div>
        </div>

        {/* Action Panel sidebar (4 columns) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-indigo-600" />
            Turnaround Timeline Trends
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Your average document verification turnaround time has decreased from <strong className="text-slate-900">3.1 days</strong> to <strong className="text-slate-900">2.4 days</strong> over the past quarter. This is 20% faster than the department benchmark SLA.
          </p>
          <div className="pt-2">
            <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Download Full Analytics Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
