import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowRight, Download, CreditCard, ChevronRight, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { PATHS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * MY LOANS PAGE COMPONENT (Master-Detail Architecture)
 * Left: Master Loan Cards (Loan Name, Loan ID, Outstanding, Interest, Next EMI, Status)
 * Right: Detailed Workspace (Overview, EMI Schedule, Transactions, Documents)
 * Bottom CTAs: Pay EMI, Download Statement, Foreclose Loan (if eligible)
 * ============================================================
 */
export default function MyLoansPage() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [detailTab, setDetailTab] = useState('Overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const fetchActiveLoans = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/loans/my');
      const list = (Array.isArray(data) && data.length > 0 ? data : [
        { id: 'LN-APP-2026-05327', loanType: 'Business', sanctionedAmount: 200000, outstandingPrincipal: 200000, interestRate: 10.5, tenureMonths: 24, emisPaid: 0, emiAmount: 9414, nextEmiDate: '2026-08-05' },
        { id: 'LN-APP-2026-27758', loanType: 'Vehicle', sanctionedAmount: 1040800, outstandingPrincipal: 1040800, interestRate: 9.25, tenureMonths: 60, emisPaid: 0, emiAmount: 62124, nextEmiDate: '2026-08-10' }
      ]).map(l => ({
        id: l.loanAccountNumber || `LN-${l.id}`,
        name: `${l.loanType || 'Business'} Loan`,
        sanctioned: l.sanctionedAmount || 0,
        outstanding: l.outstandingPrincipal || 0,
        interestRate: l.interestRate || 10.5,
        tenureMonths: l.tenureMonths || 24,
        paidMonths: l.emisPaid || 0,
        remainingMonths: (l.tenureMonths || 24) - (l.emisPaid || 0),
        nextEmi: l.emiAmount || 0,
        nextDueDate: l.nextEmiDate ? new Date(l.nextEmiDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '05 Aug 2026',
        isForeclosable: (l.emisPaid || 0) >= 6,
      }));

      setLoans(list);
      if (list.length > 0) {
        setActiveTab(list[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch active loans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLoan = loans.find(l => l.id === activeTab) || loans[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Loans</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and track your active loan accounts, statements, and schedules.</p>
        </div>
        <Button variant="primary" onClick={() => navigate(PATHS.BORROWER_APPLY)}>
          + Apply for New Loan
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-medium space-y-2 bg-slate-900/30 rounded-2xl border border-slate-800">
          <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Fetching active loan accounts...</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-900 p-12 rounded-2xl text-center space-y-4">
          <Landmark className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active loans found</h3>
          <Button variant="primary" onClick={() => navigate(PATHS.BORROWER_APPLY)}>
            Apply Now
          </Button>
        </div>
      ) : (
        /* MASTER-DETAIL LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: MASTER LOAN CARDS LIST (5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Loan Accounts ({loans.length})
            </h2>

            {loans.map(loan => {
              const isSelected = activeTab === loan.id;

              return (
                <div
                  key={loan.id}
                  onClick={() => setActiveTab(loan.id)}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer space-y-4 ${
                    isSelected
                      ? 'bg-slate-900 border-blue-600 ring-1 ring-blue-500/50 shadow-xl'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-md font-bold text-white">{loan.name}</h3>
                        <span className="text-xs font-mono text-slate-500">ID: {loan.id}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-850 text-xs">
                    <div>
                      <span className="text-slate-500 block">Outstanding</span>
                      <span className="text-white font-extrabold">{formatCurrency(loan.outstanding, false)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Next EMI</span>
                      <span className="text-emerald-400 font-bold">{formatCurrency(loan.nextEmi)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Interest Rate</span>
                      <span className="text-slate-300 font-semibold">{loan.interestRate}% p.a.</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Due Date</span>
                      <span className="text-slate-300 font-medium">{loan.nextDueDate}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <span className={`text-xs font-semibold flex items-center gap-1 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
                      Inspect Details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: LOAN DETAILS WORKSPACE (7 columns) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            {selectedLoan ? (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Landmark className="h-5 w-5 text-blue-500" />
                      {selectedLoan.name}
                    </h3>
                    <span className="text-xs font-mono text-slate-500">Loan ID: {selectedLoan.id}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>

                {/* Workspace Navigation Tabs (Overview, EMI Schedule, Transactions, Documents - Details Removed!) */}
                <div className="flex border-b border-slate-800 text-xs font-semibold gap-6 overflow-x-auto pb-1">
                  {['Overview', 'EMI Schedule', 'Transactions', 'Documents'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`pb-2 border-b-2 transition-all ${
                        detailTab === tab ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* TAB 1: OVERVIEW */}
                {detailTab === 'Overview' && (
                  <div className="space-y-6">
                    {/* Financial Summary Parameters Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 border border-slate-850 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-500 block">Loan Amount</span>
                        <span className="text-sm font-extrabold text-white">{formatCurrency(selectedLoan.sanctioned, false)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Outstanding</span>
                        <span className="text-sm font-extrabold text-white">{formatCurrency(selectedLoan.outstanding, false)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Interest Rate</span>
                        <span className="text-emerald-400 font-bold">{selectedLoan.interestRate}% P.A.</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Remaining Tenure</span>
                        <span className="text-slate-200 font-bold">{selectedLoan.remainingMonths} Months</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">EMI Amount</span>
                        <span className="text-emerald-400 font-bold">{formatCurrency(selectedLoan.nextEmi)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Next Due Date</span>
                        <span className="text-slate-200 font-bold">{selectedLoan.nextDueDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Paid EMIs</span>
                        <span className="text-slate-300 font-medium">{selectedLoan.paidMonths} of {selectedLoan.tenureMonths}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Remaining EMIs</span>
                        <span className="text-slate-300 font-medium">{selectedLoan.remainingMonths}</span>
                      </div>
                    </div>

                    {/* Outstanding Overview Doughnut Card */}
                    <div className="p-5 bg-slate-950/40 border border-slate-850 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="relative flex items-center justify-center w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-blue-500" strokeDasharray="80, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-emerald-500" strokeDasharray="20, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Outstanding</span>
                          <span className="text-xs font-bold text-white">{formatCurrency(selectedLoan.outstanding, false)}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs w-full sm:w-auto">
                        <div className="flex justify-between gap-6">
                          <span className="text-slate-400 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Principal Outstanding</span>
                          <span className="font-bold text-white">{formatCurrency(selectedLoan.outstanding * 0.9, false)}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                          <span className="text-slate-400 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Interest Component</span>
                          <span className="font-bold text-white">{formatCurrency(selectedLoan.outstanding * 0.1, false)}</span>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM ACTION BUTTONS: Pay EMI, Download Statement, Foreclose Loan (if eligible) */}
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-800">
                      <Button
                        variant="primary"
                        onClick={() => navigate(PATHS.BORROWER_EMI_CALENDAR)}
                        leftIcon={CreditCard}
                      >
                        Pay EMI
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => navigate(PATHS.BORROWER_STATEMENTS)}
                        leftIcon={Download}
                      >
                        Download Statement
                      </Button>
                      {selectedLoan.isForeclosable ? (
                        <Button
                          variant="secondary"
                          className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
                          onClick={() => alert(`Foreclosure calculation for ${selectedLoan.id}: Outstanding principal ${formatCurrency(selectedLoan.outstanding)} + 2% processing fee.`)}
                        >
                          Foreclose Loan
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-500 self-center font-medium">
                          🔒 Foreclosure eligible after 6 EMIs paid
                        </span>
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 2: EMI SCHEDULE */}
                {detailTab === 'EMI Schedule' && (
                  <div className="space-y-4 text-xs">
                    <p className="text-slate-400">Complete installment breakdown schedule:</p>
                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950">
                          <tr>
                            <th className="px-3 py-2 text-left text-slate-500 font-bold">Installment</th>
                            <th className="px-3 py-2 text-left text-slate-500 font-bold">Due Date</th>
                            <th className="px-3 py-2 text-right text-slate-500 font-bold">EMI Amount</th>
                            <th className="px-3 py-2 text-center text-slate-500 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 bg-slate-900/40 text-slate-300">
                          <tr>
                            <td className="px-3 py-2">1</td>
                            <td className="px-3 py-2">05 Jul 2026</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(selectedLoan.nextEmi)}</td>
                            <td className="px-3 py-2 text-center"><span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">Paid</span></td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2">2</td>
                            <td className="px-3 py-2">05 Aug 2026</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(selectedLoan.nextEmi)}</td>
                            <td className="px-3 py-2 text-center"><span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold">Upcoming</span></td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2">3</td>
                            <td className="px-3 py-2">05 Sep 2026</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(selectedLoan.nextEmi)}</td>
                            <td className="px-3 py-2 text-center"><span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">Upcoming</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: TRANSACTIONS */}
                {detailTab === 'Transactions' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">EMI Installment Auto-Debit</p>
                        <p className="text-[10px] text-slate-500">Ref: TXN-2026-9012 • 05 Jul 2026</p>
                      </div>
                      <span className="font-bold text-emerald-400">-{formatCurrency(selectedLoan.nextEmi)}</span>
                    </div>
                  </div>
                )}

                {/* TAB 4: DOCUMENTS */}
                {detailTab === 'Documents' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center">
                      <span className="font-bold text-white flex items-center gap-2">
                        📄 Loan Agreement & Sanction Letter ({selectedLoan.id})
                      </span>
                      <Button variant="secondary" size="sm" leftIcon={Download} onClick={() => navigate(PATHS.BORROWER_DOCUMENTS)}>
                        Download
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select a loan card on the left to inspect parameters.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
