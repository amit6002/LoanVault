import { useState, useEffect } from 'react';
import { Landmark, ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertTriangle, ChevronRight, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { api } from '../../../api/apiClient';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * BORROWER DASHBOARD COMPONENT
 * Renders real customer loan overview, active account parameters,
 * and credit metrics fetched live from Spring Boot backend.
 * ============================================================
 */
export default function BorrowerDashboard() {
  const session = JSON.parse(localStorage.getItem('lms_session') || '{}');
  const borrowerName = session.name || 'Valued Customer';

  const [summary, setSummary] = useState({
    activeLoansCount: 0,
    totalSanctioned: 0,
    totalOutstanding: 0,
    monthlyOutflow: 0,
    cibilScore: 785,
  });
  const [activeLoans, setActiveLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch summary stats
      const summaryRes = await api.get('/api/loans/summary');
      if (summaryRes) {
        setSummary({
          activeLoansCount: summaryRes.activeLoansCount || 0,
          totalSanctioned: summaryRes.totalSanctioned || 0,
          totalOutstanding: summaryRes.totalOutstanding || 0,
          monthlyOutflow: summaryRes.monthlyOutflow || 0,
          cibilScore: summaryRes.cibilScore || 785,
        });
      }

      // 2. Fetch active loans list
      const loansRes = await api.get('/api/loans/my');
      const loans = (Array.isArray(loansRes) ? loansRes : []).map(l => ({
        id: l.loanAccountNumber || `LN-${l.id}`,
        type: `${l.loanType || 'Personal'} Loan`,
        amount: l.sanctionedAmount || 0,
        outstanding: l.outstandingPrincipal || 0,
        nextEmi: l.emiAmount || 0,
        nextDueDate: l.nextEmiDate ? new Date(l.nextEmiDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
        progress: l.sanctionedAmount > 0 ? Math.round(((l.sanctionedAmount - l.outstandingPrincipal) / l.sanctionedAmount) * 100) : 0,
      }));

      setActiveLoans(loans);
    } catch (err) {
      console.warn('Failed to fetch borrower dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Welcome Message Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back, {borrowerName}
          </h1>
          <p className="text-sm text-slate-400">
            Account Status: <span className="text-emerald-500 font-semibold inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> KYC Verified</span>
          </p>
        </div>

        <div className="relative z-10 flex gap-3">
          <Link to={PATHS.BORROWER_APPLY}>
            <Button variant="primary" size="md" rightIcon={ArrowRight}>
              Apply New Loan
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Active Loans */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-blue-500/20"><Landmark className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Loans</p>
          <p className="text-2xl font-black text-white">
            {isLoading ? '...' : summary.activeLoansCount}
          </p>
        </div>

        {/* Total Outstanding Principal */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-amber-500/20"><Landmark className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Outstanding</p>
          <p className="text-2xl font-black text-white">
            {isLoading ? '...' : formatCurrency(summary.totalOutstanding, false)}
          </p>
        </div>

        {/* Monthly EMI Outgoings */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-purple-500/20"><Clock className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Outflow</p>
          <p className="text-2xl font-black text-white">
            {isLoading ? '...' : formatCurrency(summary.monthlyOutflow, false)}
          </p>
        </div>

        {/* Credit Score metric */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-emerald-500/20"><ShieldCheck className="h-8 w-8" /></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CIBIL Credit Score</p>
          <p className="text-2xl font-black text-emerald-400">
            {summary.cibilScore} <span className="text-xs font-semibold text-slate-500 ml-1">/ Excellent</span>
          </p>
        </div>

      </div>

      {/* 3. Main Workspace Division (Active list + payment triggers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active Accounts table panel (8 columns on desktop) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Active Accounts Portfolio
          </h2>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 font-medium space-y-2">
              <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching active loan accounts...</p>
            </div>
          ) : activeLoans.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <Landmark className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No active loans found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When your loan application is sanctioned by the manager and funds are disbursed, your active account details will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeLoans.map((loan) => (
                <div 
                  key={loan.id}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-850 pb-4 mb-4">
                    <div>
                      <h3 className="text-md font-bold text-white flex items-center gap-2">
                        <Landmark className="h-4.5 w-4.5 text-blue-500" />
                        {loan.type}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Account ID: <code className="text-slate-400">{loan.id}</code></p>
                    </div>
                    <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-500 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Standard Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">Sanctioned Amount</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(loan.amount, false)}</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">Outstanding</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(loan.outstanding, false)}</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">Next EMI</span>
                      <span className="text-slate-200 font-bold">{formatCurrency(loan.nextEmi)}</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">Due Date</span>
                      <span className="text-slate-200 font-bold">{loan.nextDueDate}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Repayment Progress</span>
                      <span className="text-slate-300 font-semibold">{loan.progress}% paid</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.max(0, loan.progress))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Panel sidebar (4 columns on desktop) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Immediate Actions
          </h2>

          <div className="space-y-4">
            {summary.monthlyOutflow > 0 && (
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex gap-3 items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-400">EMI Auto-Debit Active</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Ensure account balance holds at least {formatCurrency(summary.monthlyOutflow)} before your next due date to prevent overdraft charges.
                  </p>
                </div>
              </div>
            )}

            {/* Quick links list */}
            <div className="divide-y divide-slate-800">
              <Link to={PATHS.BORROWER_LOANS} className="flex items-center justify-between py-3 text-sm font-semibold text-slate-300 hover:text-white group">
                View Transaction Statement
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
              <Link to={PATHS.BORROWER_APPLICATIONS} className="flex items-center justify-between py-3 text-sm font-semibold text-slate-300 hover:text-white group">
                Track Application Status
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
