import { useState } from 'react';
import { Landmark, ArrowRight, ShieldCheck, HelpCircle, Receipt, Download, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * MY LOANS PAGE COMPONENT
 * Renders active loan detailed parameters, principal/interest breakdown,
 * and a table of transaction statement history.
 * ============================================================
 */
export default function MyLoansPage() {
  const [activeTab, setActiveTab] = useState('LN-2026-04921'); // Default loan selected

  const loans = [
    {
      id: 'LN-2026-04921',
      name: 'Home Prime Loan',
      sanctioned: 4500000,
      outstanding: 4235000,
      interestRate: 8.4,
      tenureMonths: 240,
      paidMonths: 12,
      nextEmi: 37400,
      nextDueDate: '05 Aug 2026',
    },
    {
      id: 'LN-2026-08119',
      name: 'Personal Flexi Loan',
      sanctioned: 300000,
      outstanding: 120000,
      interestRate: 10.5,
      tenureMonths: 36,
      paidMonths: 20,
      nextEmi: 15400,
      nextDueDate: '10 Aug 2026',
    }
  ];

  const transactions = {
    'LN-2026-04921': [
      { id: 'TXN-9021', date: '05 Jul 2026', amount: 37400, principal: 7800, interest: 29600, status: 'PAID' },
      { id: 'TXN-8845', date: '05 Jun 2026', amount: 37400, principal: 7750, interest: 29650, status: 'PAID' },
      { id: 'TXN-8511', date: '05 May 2026', amount: 37400, principal: 7700, interest: 29700, status: 'PAID' },
    ],
    'LN-2026-08119': [
      { id: 'TXN-7612', date: '10 Jul 2026', amount: 15400, principal: 14350, interest: 1050, status: 'PAID' },
      { id: 'TXN-7431', date: '10 Jun 2026', amount: 15400, principal: 14200, interest: 1200, status: 'PAID' },
      { id: 'TXN-7190', date: '10 May 2026', amount: 15400, principal: 14050, interest: 1350, status: 'PAID' },
    ]
  };

  const selectedLoan = loans.find(l => l.id === activeTab) || loans[0];
  const activeTxns = transactions[selectedLoan.id] || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Active Loans</h1>
        <p className="text-sm text-slate-400 mt-1">Review active balances, rates, and transaction summaries.</p>
      </div>

      {/* 2. Loan Selector Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        {loans.map(loan => (
          <button
            key={loan.id}
            type="button"
            onClick={() => setActiveTab(loan.id)}
            className={`px-4 py-2.5 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-all focus:outline-none ${
              activeTab === loan.id 
                ? 'border-b-2 border-blue-500 bg-slate-900/60 text-blue-400' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            {loan.name} ({loan.id})
          </button>
        ))}
      </div>

      {/* 3. Selected Loan Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Outstanding Balance */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-blue-500/10"><Landmark className="h-8 w-8" /></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Principal</span>
          <h3 className="text-2xl font-black text-white">{formatCurrency(selectedLoan.outstanding, false)}</h3>
          <p className="text-xs text-slate-400">Sanctioned: {formatCurrency(selectedLoan.sanctioned, false)}</p>
        </div>

        {/* Repayment details */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-purple-500/10"><Receipt className="h-8 w-8" /></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next installment Due</span>
          <h3 className="text-2xl font-black text-emerald-400">{formatCurrency(selectedLoan.nextEmi)}</h3>
          <p className="text-xs text-slate-400">Due Date: {selectedLoan.nextDueDate}</p>
        </div>

        {/* Pricing details */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-amber-500/10"><RefreshCw className="h-8 w-8" /></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Parameters</span>
          <h3 className="text-2xl font-black text-white">{selectedLoan.interestRate}% <span className="text-xs font-medium text-slate-500">P.A. (Fixed)</span></h3>
          <p className="text-xs text-slate-400">Remaining Term: {selectedLoan.tenureMonths - selectedLoan.paidMonths} of {selectedLoan.tenureMonths} Months</p>
        </div>

      </div>

      {/* 4. Transactions List Table */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Receipt className="h-4.5 w-4.5 text-blue-400" />
            Repayment Transaction Statements
          </h3>
          <Button variant="secondary" size="sm" leftIcon={Download}>
            Download Statement
          </Button>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-400">Transaction ID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-400">Date Paid</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400">Principal</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400">Interest</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400">Total Paid</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 bg-slate-900/20">
              {activeTxns.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{txn.id}</td>
                  <td className="px-4 py-3 text-slate-300">{txn.date}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(txn.principal)}</td>
                  <td className="px-4 py-3 text-right text-slate-400">{formatCurrency(txn.interest)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-200">{formatCurrency(txn.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
