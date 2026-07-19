import { Award, CheckCircle2, AlertTriangle, Clock, RefreshCw, BarChart2, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * OFFICER PERFORMANCE TRACKER COMPONENT
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
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Performance Reports</h1>
        <p className="text-sm text-slate-400 mt-1">Review processed audit workload stats, verification quality indexes, and compliance scores.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-850 p-5 rounded-xl space-y-2 relative overflow-hidden">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{stat.value}</span>
              {stat.trend && (
                <span className="text-[10px] font-bold text-emerald-400">✓ Target Met</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Detailed Analysis section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Quality checkpoint grid (8 columns) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Award className="h-5 w-5 text-blue-500" />
            Verification Quality Benchmarks
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
              <div className="space-y-1">
                <h5 className="font-bold text-white text-sm">Income Verification Accuracy</h5>
                <p className="text-slate-500">Cross-auditing salary slips with ITR declarations.</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                100% Quality Pass
              </span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
              <div className="space-y-1">
                <h5 className="font-bold text-white text-sm">KYC Address Match Index</h5>
                <p className="text-slate-500">Matching utility bills against Aadhaar location databases.</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                99.2% Quality Pass
              </span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
              <div className="space-y-1">
                <h5 className="font-bold text-white text-sm">Compliance Audit Log Filing</h5>
                <p className="text-slate-500">Submitting checklist verification summaries to Manager queues.</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                100% Quality Pass
              </span>
            </div>
          </div>
        </div>

        {/* Action Panel sidebar (4 columns) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-blue-500" />
            Turnaround Timeline Trends
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your average document verification turnaround time has decreased from **3.1 days** to **2.4 days** over the past quarter. This is 20% faster than the department benchmark SLA.
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
