import { useState } from 'react';
import { Users, RefreshCw, CheckCircle2, TrendingUp, Clock, BarChart2, Award, AlertCircle } from 'lucide-react';

/**
 * ============================================================
 * TEAM MANAGEMENT PAGE — PREMIUM EDITION
 * Officer cards with avatars, performance bars, workload
 * indicators, and Auto-Balance action with animated feedback.
 * ============================================================
 */

const OFFICER_COLORS = ['indigo', 'emerald', 'amber', 'purple', 'rose'];
const AVATAR_BG = {
  indigo: 'from-indigo-600 to-indigo-700',
  emerald: 'from-emerald-600 to-emerald-700',
  amber: 'from-amber-500 to-amber-600',
  purple: 'from-purple-600 to-purple-700',
  rose: 'from-rose-600 to-rose-700',
};

const INITIAL_OFFICERS = [
  { id: 'OFF-101', name: 'Amit Sharma',   activeCases: 5,  processed: 124, avgTime: '2.1 Days', joined: 'Jan 2023', colorKey: 'indigo' },
  { id: 'OFF-102', name: 'Pooja Verma',   activeCases: 7,  processed: 98,  avgTime: '2.8 Days', joined: 'Mar 2023', colorKey: 'emerald' },
  { id: 'OFF-103', name: 'Rajesh Nair',   activeCases: 2,  processed: 156, avgTime: '1.9 Days', joined: 'Nov 2022', colorKey: 'amber' },
  { id: 'OFF-104', name: 'Sneha Pillai',  activeCases: 4,  processed: 87,  avgTime: '3.2 Days', joined: 'Jun 2023', colorKey: 'purple' },
];

function getWorkloadLabel(count) {
  if (count >= 7) return { label: 'Overloaded', cls: 'text-rose-600 bg-rose-50 border-rose-200' };
  if (count >= 5) return { label: 'High Load',  cls: 'text-amber-600 bg-amber-50 border-amber-200' };
  if (count >= 3) return { label: 'Moderate',   cls: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
  return { label: 'Light Load', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function TeamManagementPage() {
  const [officers, setOfficers] = useState(INITIAL_OFFICERS);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const totalActive    = officers.reduce((s, o) => s + o.activeCases, 0);
  const totalProcessed = officers.reduce((s, o) => s + o.processed, 0);
  const maxProcessed   = Math.max(...officers.map(o => o.processed), 1);

  const handleRebalance = () => {
    setIsRebalancing(true);
    setSuccessMessage('');
    setTimeout(() => {
      setIsRebalancing(false);
      setOfficers(prev =>
        prev.map(o => {
          if (o.id === 'OFF-102') return { ...o, activeCases: o.activeCases - 2 };
          if (o.id === 'OFF-103') return { ...o, activeCases: o.activeCases + 2 };
          return o;
        })
      );
      setSuccessMessage('2 pending cases moved from Pooja Verma → Rajesh Nair. Workloads balanced.');
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl border border-indigo-200">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            Team Management
          </h1>
          <p className="text-sm text-slate-500 ml-16">
            Monitor Loan Officer productivity and rebalance pipeline workloads.
          </p>
        </div>
        <button
          onClick={handleRebalance}
          disabled={isRebalancing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-smooth-fast shadow-card disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isRebalancing ? 'animate-spin' : ''}`} />
          {isRebalancing ? 'Rebalancing…' : 'Auto-Balance Workloads'}
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {successMessage && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 animate-slide-up">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800 font-semibold">{successMessage}</p>
        </div>
      )}

      {/* SUMMARY STATS ROW */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Officers',  value: officers.length,  icon: Users,    cls: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
          { label: 'Active Cases',     value: totalActive,      icon: BarChart2, cls: 'bg-amber-50 border-amber-100 text-amber-600'   },
          { label: 'Cases Processed',  value: totalProcessed,   icon: Award,    cls: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-card flex items-center gap-4">
            <div className={`p-3 rounded-xl border ${cls}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* OFFICER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {officers.map((officer) => {
          const workload   = getWorkloadLabel(officer.activeCases);
          const performance = Math.round((officer.processed / maxProcessed) * 100);
          const avatarBg   = AVATAR_BG[officer.colorKey] || AVATAR_BG.indigo;

          return (
            <div
              key={officer.id}
              className="bg-white border border-slate-200/80 rounded-2xl shadow-card hover:shadow-card-md hover:border-indigo-200 transition-smooth-fast overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${avatarBg} text-white flex items-center justify-center font-black text-sm shadow-md flex-shrink-0`}>
                  {getInitials(officer.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{officer.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{officer.id} · Since {officer.joined}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${workload.cls}`}>
                  {workload.label}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {/* Performance Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-indigo-500" />
                      Cases Processed
                    </span>
                    <span className="font-bold text-slate-900">{officer.processed}</span>
                  </div>
                  <div className="progress-bar-indigo">
                    <div style={{ width: `${performance}%` }} />
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-400 font-semibold flex items-center gap-1 mb-1">
                      <AlertCircle className="h-3 w-3 text-amber-400" />
                      Active Cases
                    </p>
                    <p className={`text-lg font-black ${officer.activeCases >= 7 ? 'text-rose-600' : officer.activeCases >= 5 ? 'text-amber-600' : 'text-slate-900'}`}>
                      {officer.activeCases}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-400 font-semibold flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3 text-emerald-400" />
                      Avg Turnaround
                    </p>
                    <p className="text-lg font-black text-emerald-700">{officer.avgTime}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Officer Performance Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['Officer ID', 'Officer Name', 'Active Cases', 'Total Processed', 'Avg SLA'].map(col => (
                  <th key={col} className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {officers.map(o => {
                const workload = getWorkloadLabel(o.activeCases);
                return (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-indigo-600">{o.id}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{o.name}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${workload.cls}`}>
                        {o.activeCases} cases
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-slate-700">{o.processed}</td>
                    <td className="px-5 py-4 text-emerald-700 font-bold">{o.avgTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
