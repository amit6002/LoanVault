import { useState, useEffect } from 'react';
import { Landmark, ArrowRight, ShieldCheck, HelpCircle, Receipt, Download, RefreshCw, XCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * MY LOANS PAGE COMPONENT
 * Renders active loan detailed parameters, principal/interest breakdown,
 * and a table of transaction statement history fetched from backend API.
 * ============================================================
 */
export default function MyLoansPage() {
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const fetchActiveLoans = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/loans/my');
      const list = (Array.isArray(data) ? data : []).map(l => ({
        id: l.loanAccountNumber || `LN-${l.id}`,
        name: `${l.loanType || 'Personal'} Loan`,
        sanctioned: l.sanctionedAmount || 0,
        outstanding: l.outstandingPrincipal || 0,
        interestRate: l.interestRate || 10.5,
        tenureMonths: l.tenureMonths || 12,
        paidMonths: l.emisPaid || 0,
        nextEmi: l.emiAmount || 0,
        nextDueDate: l.nextEmiDate ? new Date(l.nextEmiDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
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
      
      {/* 1. Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Active Loans</h1>
        <p className="text-sm text-slate-400 mt-1">Review active balances, rates, and transaction summaries.</p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-400 font-medium space-y-2 bg-slate-900/30 rounded-xl border border-slate-800">
          <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Fetching active loan details from backend...</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-900 p-12 rounded-2xl text-center space-y-4">
          <Landmark className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active loans found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            You do not have any active disbursed loans at this moment. Apply for a new loan or track pending applications.
          </p>
        </div>
      ) : (
        <>
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
          {selectedLoan && (
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
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Installment Due</span>
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
          )}
        </>
      )}
    </div>
  );
}
