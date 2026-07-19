import { useState } from 'react';
import { RefreshCw, UserCheck, CheckCircle2 } from 'lucide-react';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * TEAM MANAGEMENT PAGE COMPONENT
 * Renders list of active Loan Officers, their case loads,
 * SLA speeds, and allows case workload reassignments.
 * ============================================================
 */
export default function TeamManagementPage() {
  const [officers, setOfficers] = useState([
    { id: 'OFF-101', name: 'Amit Sharma', activeCases: 5, processed: 124, avgTime: '2.1 Days' },
    { id: 'OFF-102', name: 'Pooja Verma', activeCases: 7, processed: 98, avgTime: '2.8 Days' },
    { id: 'OFF-103', name: 'Rajesh Nair', activeCases: 2, processed: 156, avgTime: '1.9 Days' },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRebalance = () => {
    setIsLoading(true);
    setSuccessMessage('');
    setTimeout(() => {
      setIsLoading(false);
      setOfficers(prev => prev.map(o => {
        if (o.id === 'OFF-102') return { ...o, activeCases: o.activeCases - 2 };
        if (o.id === 'OFF-103') return { ...o, activeCases: o.activeCases + 2 };
        return o;
      }));
      setSuccessMessage('Workloads rebalanced successfully! 2 pending cases reassigned from Pooja to Rajesh.');
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Team Management</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor Loan Officer productivity and balance pipeline workloads.</p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={RefreshCw} onClick={handleRebalance} isLoading={isLoading}>
          Auto-Balance Workloads
        </Button>
      </div>

      {/* Inline success feedback — no alert() */}
      {successMessage && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-400 font-medium">{successMessage}</p>
        </div>
      )}

      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
        <div className="overflow-x-auto border border-slate-800 rounded-xl text-xs">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-400">Officer ID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-400">Officer Name</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400">Active Cases</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400">Total Processed</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400">Avg turnaround SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/20 text-slate-300">
              {officers.map(o => (
                <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-500">{o.id}</td>
                  <td className="px-4 py-3 font-bold text-white text-sm">{o.name}</td>
                  <td className="px-4 py-3 text-right text-amber-500 font-semibold">{o.activeCases} pending</td>
                  <td className="px-4 py-3 text-right">{o.processed} cases</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-semibold">{o.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
