import { useState } from 'react';
import { Coins, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * LOAN DISBURSEMENTS PAGE COMPONENT
 * Renders lists of sanctioned loans waiting for bank transfers.
 * ============================================================
 */
export default function DisbursementsPage() {
  const [disbursedList, setDisbursedList] = useState([
    { id: 'DSB-902', name: 'John Doe Home Loan', amount: 4500000, status: 'PENDING', bank: 'SBI A/C ****4910' },
    { id: 'DSB-103', name: 'Pooja Auto Loan', amount: 300000, status: 'PENDING', bank: 'HDFC A/C ****8231' },
  ]);

  const [loadingId, setLoadingId] = useState(null);
  const [recentlyDisbursed, setRecentlyDisbursed] = useState(null);

  const handleDisburse = (id) => {
    setLoadingId(id);
    setRecentlyDisbursed(null);
    setTimeout(() => {
      setLoadingId(null);
      setDisbursedList(prev => prev.map(d => {
        if (d.id === id) return { ...d, status: 'DISBURSED' };
        return d;
      }));
      setRecentlyDisbursed(id);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Disbursement Hub</h1>
        <p className="text-sm text-slate-400 mt-1">Initiate and authorize final funds transfer actions to borrower accounts.</p>
      </div>

      {/* Inline success confirmation — no alert() */}
      {recentlyDisbursed && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-400 font-medium">
            Fund release sequence initiated successfully for disbursement ref: <code className="font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">{recentlyDisbursed}</code>. 
            The transfer will be processed within 1–2 business hours.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {disbursedList.map(item => (
          <div key={item.id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-slate-500">REF: {item.id}</span>
              <h4 className="text-md font-bold text-white">{item.name}</h4>
              <p className="text-xs text-slate-500">Target Transfer Destination: <code className="text-slate-400">{item.bank}</code></p>
            </div>
            <div className="flex sm:items-center gap-4 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
              <div className="text-right">
                <span className="text-md font-bold text-white block">{formatCurrency(item.amount, false)}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === 'DISBURSED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                }`}>{item.status}</span>
              </div>
              {item.status === 'PENDING' && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  leftIcon={Coins}
                  onClick={() => handleDisburse(item.id)} 
                  isLoading={loadingId === item.id}
                >
                  Release Funds
                </Button>
              )}
              {item.status === 'DISBURSED' && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Transferred
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
