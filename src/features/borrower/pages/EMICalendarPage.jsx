import { useState } from 'react';
import { Clock, Calendar, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * EMI CALENDAR PAGE COMPONENT
 * Renders upcoming payment cycles, due parameters, and lets
 * user filter EMIs based on paid / unpaid status.
 * ============================================================
 */
export default function EMICalendarPage() {
  const [filter, setFilter] = useState('ALL'); // ALL, UPCOMING, PAID, OVERDUE

  const emiSchedules = [
    { id: 'SCH-01', loanName: 'Home Prime Loan', dueDate: '05 Aug 2026', amount: 37400, principal: 7800, interest: 29600, status: 'UPCOMING' },
    { id: 'SCH-02', loanName: 'Personal Flexi Loan', dueDate: '10 Aug 2026', amount: 15400, principal: 14350, interest: 1050, status: 'UPCOMING' },
    { id: 'SCH-03', loanName: 'Home Prime Loan', dueDate: '05 Jul 2026', amount: 37400, principal: 7800, interest: 29600, status: 'PAID' },
    { id: 'SCH-04', loanName: 'Personal Flexi Loan', dueDate: '10 Jul 2026', amount: 15400, principal: 14350, interest: 1050, status: 'PAID' },
    { id: 'SCH-05', loanName: 'Gold Loan (Closed)', dueDate: '15 Jun 2026', amount: 80000, principal: 78500, interest: 1500, status: 'PAID' },
  ];

  const filteredSchedule = emiSchedules.filter(item => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const statusColors = {
    UPCOMING: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    PAID: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    OVERDUE: 'bg-red-500/10 text-red-500 border border-red-500/20',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">EMI Repayment Calendar</h1>
        <p className="text-sm text-slate-400 mt-1">Track monthly due dates and interest splits for auto-debit payments.</p>
      </div>

      {/* 2. Stat Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Due Next Month</span>
            <span className="text-xl font-bold text-white mt-1">{formatCurrency(52800, false)}</span>
          </div>
          <Clock className="h-8 w-8 text-blue-500/20" />
        </div>
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Auto-Debit Accounts</span>
            <span className="text-xl font-bold text-white mt-1">2 Loans Active</span>
          </div>
          <ShieldCheck className="h-8 w-8 text-emerald-500/20" />
        </div>
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Overdue Penalty</span>
            <span className="text-xl font-bold text-emerald-500 mt-1">₹0.00</span>
          </div>
          <AlertTriangle className="h-8 w-8 text-emerald-500/20" />
        </div>
      </div>

      {/* 3. Filter tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        {['ALL', 'UPCOMING', 'PAID'].map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all focus:outline-none ${
              filter === tab 
                ? 'border-b-2 border-blue-500 text-blue-400 font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()} Payments
          </button>
        ))}
      </div>

      {/* 4. Schedule list grid */}
      <div className="space-y-4">
        {filteredSchedule.map(item => (
          <div 
            key={item.id}
            className="p-5 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-850 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-slate-900 rounded-lg text-slate-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-md font-bold text-white">{item.loanName}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Due Date: <span className="text-slate-300 font-semibold">{item.dueDate}</span></p>
              </div>
            </div>

            <div className="flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-850 pt-3 sm:pt-0 gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-auto ${statusColors[item.status]}`}>
                {item.status}
              </span>
              <div className="text-right">
                <span className="text-md font-bold text-white block">{formatCurrency(item.amount)}</span>
                <span className="text-[10px] text-slate-500 block">Principal: {formatCurrency(item.principal)} \| Interest: {formatCurrency(item.interest)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
