import { useState } from 'react';
import { ShieldAlert, PhoneCall, Mail, AlertTriangle, Coins } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * NPA COLLECTION MONITOR PAGE COMPONENT (LIGHT THEME)
 * Renders lists of accounts exceeding due timelines.
 * ============================================================
 */
export default function NPAMonitorPage() {
  const [overdues] = useState([
    { id: 'LN-NPA-401', clientName: 'Dev Enterprises', overdueDays: 78, outstanding: 1250000, status: 'SMA-2' },
    { id: 'LN-NPA-902', clientName: 'Rajesh Sharma', overdueDays: 42, outstanding: 340000, status: 'SMA-1' }
  ]);

  const handleNotify = (client) => {
    alert(`System reminder notification issued to client: ${client}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">NPA Collector Queue</h1>
        <p className="text-sm text-slate-500 mt-1">Audit high-risk overdue loan accounts and initiate settlement communication procedures.</p>
      </div>

      <div className="space-y-4">
        {overdues.map(item => (
          <div key={item.id} className="p-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs hover:border-indigo-500/50 transition-all">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-indigo-600">ID: {item.id}</span>
              <h4 className="text-md font-bold text-slate-900">{item.clientName}</h4>
              <p className="text-xs text-rose-700 font-bold">{item.overdueDays} Days Overdue ({item.status} Class)</p>
            </div>
            <div className="flex sm:items-center gap-4 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0">
              <div className="text-right">
                <span className="text-md font-black text-slate-900 block">{formatCurrency(item.outstanding, false)}</span>
                <span className="text-[10px] text-slate-500 font-medium block">Total Default Exposure</span>
              </div>
              <Button variant="secondary" size="sm" leftIcon={Mail} onClick={() => handleNotify(item.clientName)}>
                Issue Notice
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
