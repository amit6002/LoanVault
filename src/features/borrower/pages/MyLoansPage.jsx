import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Landmark, ArrowRight, ShieldCheck, HelpCircle, Receipt, Download, RefreshCw, Search, Filter, Plus, Calendar, DollarSign, CheckCircle2, ChevronRight } from 'lucide-react';
import { PATHS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * MY LOANS PAGE COMPONENT
 * Redesigned matching modern dark-mode UI aesthetic.
 * Renders active loan detailed parameters, outstanding breakdown,
 * and expandable account tabs with transaction statements.
 * ============================================================
 */
export default function MyLoansPage() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [detailTab, setDetailTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
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
        nextDueDate: l.nextEmiDate ? new Date(l.nextEmiDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '05 Aug 2026',
        progress: l.sanctionedAmount > 0 ? Math.round(((l.sanctionedAmount - l.outstandingPrincipal) / l.sanctionedAmount) * 100) : 10,
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

  const filteredLoans = loans.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedLoan = loans.find(l => l.id === activeTab) || filteredLoans[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Page Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Active Loans</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and track your ongoing loan accounts, EMI schedules, and statements.</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            leftIcon={Plus}
            onClick={() => navigate(PATHS.BORROWER_APPLY)}
          >
            Apply for New Loan
          </Button>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/40 p-4 border border-slate-800 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search loans by ID or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-semibold self-end sm:self-auto">
          Showing {filteredLoans.length} of {loans.length} active accounts
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-medium space-y-2 bg-slate-900/30 rounded-2xl border border-slate-800">
          <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Fetching active loan details from database...</p>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-900 p-12 rounded-2xl text-center space-y-4">
          <Landmark className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active loans found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            You do not have any active disbursed loans at this moment. Apply for a new loan or check your submitted applications.
          </p>
          <Button variant="primary" leftIcon={Plus} onClick={() => navigate(PATHS.BORROWER_APPLY)}>
            Apply Now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Loan Card List (6 columns) */}
          <div className="lg:col-span-6 space-y-4">
            {filteredLoans.map(loan => {
              const isSelected = activeTab === loan.id;

              return (
                <div
                  key={loan.id}
                  onClick={() => setActiveTab(loan.id)}
                  className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer space-y-4 ${
                    isSelected
                      ? 'bg-slate-900 border-blue-600 ring-1 ring-blue-500/50 shadow-xl'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                        <Landmark className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-md font-bold text-white">{loan.name}</h3>
                        <span className="text-xs font-mono text-slate-500">Account ID: {loan.id}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-850 text-xs">
                    <div>
                      <span className="text-slate-500 block">Sanctioned</span>
                      <span className="text-white font-bold">{formatCurrency(loan.sanctioned, false)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Outstanding</span>
                      <span className="text-white font-bold">{formatCurrency(loan.outstanding, false)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Interest Rate</span>
                      <span className="text-emerald-400 font-bold">{loan.interestRate}% p.a.</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tenure</span>
                      <span className="text-slate-300 font-medium">{loan.tenureMonths} Months</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-400">
                      <span>Repayment Progress</span>
                      <span>{loan.progress}% Paid</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, Math.max(5, loan.progress))}%` }} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                      View Account Details <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Account Workspace (6 columns) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            {selectedLoan ? (
              <div className="space-y-6">
                
                {/* Workspace Header */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Landmark className="h-5 w-5 text-blue-500" />
                      {selectedLoan.name}
                    </h3>
                    <span className="text-xs font-mono text-slate-500">ID: {selectedLoan.id}</span>
                  </div>
                  <Button variant="secondary" size="sm" leftIcon={Download}>
                    Statement
                  </Button>
                </div>

                {/* Account Navigation Tabs */}
                <div className="flex border-b border-slate-800 text-xs font-semibold gap-4 overflow-x-auto pb-1">
                  {['Overview', 'EMI Schedule', 'Transactions', 'Details'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`pb-2 border-b-2 transition-all ${
                        detailTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab 1: Overview Panel */}
                {detailTab === 'Overview' && (
                  <div className="space-y-6">
                    {/* Loan Summary Grid */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 border border-slate-850 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-500 block">Sanction Amount</span>
                        <span className="text-sm font-extrabold text-white">{formatCurrency(selectedLoan.sanctioned, false)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Outstanding Principal</span>
                        <span className="text-sm font-extrabold text-white">{formatCurrency(selectedLoan.outstanding, false)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Interest Rate</span>
                        <span className="text-emerald-400 font-bold">{selectedLoan.interestRate}% P.A.</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Monthly Installment (EMI)</span>
                        <span className="text-emerald-400 font-bold">{formatCurrency(selectedLoan.nextEmi)}</span>
                      </div>
                    </div>

                    {/* Next Payment Card */}
                    <div className="p-4 bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-blue-300">Upcoming EMI Installment</span>
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold">
                          Due Soon
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline">
                        <div>
                          <p className="text-2xl font-black text-white">{formatCurrency(selectedLoan.nextEmi)}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Due Date: {selectedLoan.nextDueDate}</p>
                        </div>
                        <Button variant="primary" size="sm">
                          Pay EMI Now
                        </Button>
                      </div>
                    </div>

                    {/* Statement Transactions Log */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Transactions</h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-bold text-white">EMI Installment Received</p>
                              <p className="text-[10px] text-slate-500">05 Jul 2026</p>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-400">-{formatCurrency(selectedLoan.nextEmi)}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Tab 2: EMI Schedule */}
                {detailTab === 'EMI Schedule' && (
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-400">Repayment breakdown across remaining {selectedLoan.tenureMonths} installments:</p>
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-500">Installment Amount</span>
                        <span className="text-white font-bold">{formatCurrency(selectedLoan.nextEmi)} / Month</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-500">Next Auto-Debit Date</span>
                        <span className="text-emerald-400 font-bold">{selectedLoan.nextDueDate}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Principal / Interest Split</span>
                        <span className="text-slate-300 font-mono">75% Principal / 25% Interest</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Details */}
                {detailTab === 'Details' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Loan Account Number</span>
                        <span className="text-white font-mono">{selectedLoan.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rate Structure</span>
                        <span className="text-slate-300">Fixed Rate @ {selectedLoan.interestRate}% P.A.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Disbursement Status</span>
                        <span className="text-emerald-400 font-bold">Disbursed & Active</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select a loan card on the left to inspect detailed parameters.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
